"""
Odoo Connection Module
======================
Handles JSON-RPC connection to Odoo server with proper error handling.
"""

import json
import logging
import ssl
import time
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional

from lib.python.odoo_reusable.core.config import Configuration
from lib.python.odoo_reusable.core.exceptions import (
    AuthenticationError,
    NotFoundError,
    OdooConnectionError,
    OperationError,
)

logger = logging.getLogger(__name__)


class OdooConnection:
    """Manages connection to Odoo JSON-RPC API."""

    def __init__(self, config: Optional[Configuration] = None):
        self._config = config or Configuration()
        self._uid: Optional[int] = None
        self._connected = False

        self._ssl_context = ssl.create_default_context()
        if not self._config.odoo_verify_ssl:
            self._ssl_context.check_hostname = False
            self._ssl_context.verify_mode = ssl.CERT_NONE

    @property
    def url(self) -> str:
        return self._config.odoo_url

    @property
    def db(self) -> str:
        return self._config.odoo_db

    @property
    def username(self) -> Optional[str]:
        return self._config.odoo_username

    @property
    def password(self) -> Optional[str]:
        return self._config.odoo_password

    @property
    def config(self) -> Configuration:
        return self._config

    @property
    def uid(self) -> int:
        if self._uid is None:
            raise OdooConnectionError("Not authenticated. Call connect() first.")
        return self._uid

    @property
    def is_connected(self) -> bool:
        return self._connected and self._uid is not None

    @property
    def jsonrpc_endpoint(self) -> str:
        endpoint = str(self._config.odoo_jsonrpc_endpoint or "/jsonrpc").strip()
        if not endpoint.startswith("/"):
            endpoint = f"/{endpoint}"
        return endpoint

    def _json_call(
        self,
        service: str,
        method: str,
        args: List[Any],
        kwargs: Optional[Dict[str, Any]] = None,
    ) -> Any:
        endpoint = f"{self.url.rstrip('/')}{self.jsonrpc_endpoint}"
        try:
            timeout_seconds = float(self._config.get("odoo.timeout", 120))
            if timeout_seconds <= 0:
                timeout_seconds = 120.0
        except Exception:
            timeout_seconds = 120.0

        params = {
            "service": service,
            "method": method,
            "args": args,
        }
        if kwargs:
            params["kwargs"] = kwargs

        data = {
            "jsonrpc": "2.0",
            "method": "call",
            "params": params,
            "id": int(time.time()),
        }

        encoded_data = json.dumps(data).encode("utf-8")
        request = urllib.request.Request(
            endpoint,
            data=encoded_data,
            headers={"Content-Type": "application/json"},
        )

        try:
            with urllib.request.urlopen(
                request,
                context=self._ssl_context,
                timeout=timeout_seconds,
            ) as response:
                result = json.loads(response.read().decode("utf-8"))
                if "error" in result:
                    raise Exception(f"JSON-RPC Error: {result['error']}")
                return result.get("result")
        except urllib.error.URLError as exc:
            raise OdooConnectionError(f"Network error: {exc}", url=self.url)

    def connect(self) -> int:
        """Establish connection and authenticate with Odoo."""
        try:
            self._uid = self._json_call(
                "common",
                "authenticate",
                [self.db, self.username, self.password, {}],
            )

            if not self._uid:
                raise AuthenticationError(
                    "Authentication failed. Check your credentials.",
                    url=self.url,
                    db=self.db,
                )

            self._connected = True
            logger.info("Connected to Odoo as user ID: %s", self._uid)
            return self._uid
        except AuthenticationError:
            raise
        except Exception as exc:
            raise OdooConnectionError(
                f"Failed to connect to Odoo: {exc}",
                url=self.url,
                db=self.db,
                original_error=exc,
            )

    def disconnect(self) -> None:
        self._uid = None
        self._connected = False
        logger.info("Disconnected from Odoo")

    def __enter__(self) -> "OdooConnection":
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.disconnect()

    def execute(self, model: str, method: str, *args, **kwargs) -> Any:
        """Execute a method on an Odoo model."""
        if not self.is_connected:
            self.connect()

        retry_attempts = self._config.retry_attempts
        last_error = None

        for attempt in range(retry_attempts):
            try:
                return self._json_call(
                    "object",
                    "execute_kw",
                    [self.db, self.uid, self.password, model, method, list(args)],
                    kwargs,
                )
            except Exception as exc:
                error_msg = str(exc)
                last_error = exc

                if "does not exist" in error_msg.lower():
                    raise NotFoundError(
                        f"Record not found in {model}",
                        resource_type=model,
                        identifier=str(args),
                    )

                if "traceback" in error_msg.lower() or "fault" in error_msg.lower():
                    raise OperationError(
                        f"Odoo operation failed: {error_msg}",
                        model=model,
                        operation=method,
                        original_error=exc,
                    )

                logger.warning(
                    "Operation attempt %s/%s failed: %s",
                    attempt + 1,
                    retry_attempts,
                    exc,
                )
                if attempt < retry_attempts - 1:
                    time.sleep(self._config.get("processing.retry_delay", 5))

        raise OperationError(
            f"Operation failed after {retry_attempts} attempts",
            model=model,
            operation=method,
            original_error=last_error,
        )

    def search(
        self,
        model: str,
        domain: List,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        order: Optional[str] = None,
    ) -> List[int]:
        kwargs = {}
        if limit is not None:
            kwargs["limit"] = limit
        if offset is not None:
            kwargs["offset"] = offset
        if order is not None:
            kwargs["order"] = order
        return self.execute(model, "search", domain, **kwargs)

    def search_read(
        self,
        model: str,
        domain: List,
        fields: Optional[List[str]] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        order: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        kwargs = {}
        if fields is not None:
            kwargs["fields"] = fields
        if limit is not None:
            kwargs["limit"] = limit
        if offset is not None:
            kwargs["offset"] = offset
        if order is not None:
            kwargs["order"] = order
        return self.execute(model, "search_read", domain, **kwargs)

    def read(
        self,
        model: str,
        ids: List[int],
        fields: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        kwargs = {}
        if fields is not None:
            kwargs["fields"] = fields
        return self.execute(model, "read", ids, **kwargs)

    def create(self, model: str, values: Dict[str, Any]) -> int:
        if self._config.dry_run:
            logger.info("[DRY RUN] Would create %s with values: %s", model, values)
            return -1
        return self.execute(model, "create", values)

    def write(self, model: str, ids: List[int], values: Dict[str, Any]) -> bool:
        if self._config.dry_run:
            logger.info("[DRY RUN] Would update %s IDs %s with values: %s", model, ids, values)
            return True
        return self.execute(model, "write", ids, values)

    def unlink(self, model: str, ids: List[int]) -> bool:
        if self._config.dry_run:
            logger.info("[DRY RUN] Would delete %s IDs: %s", model, ids)
            return True
        return self.execute(model, "unlink", ids)

    def browse(self, model: str, ids: List[int]) -> "OdooRecordSet":
        return OdooRecordSet(self, model, ids)


class OdooRecordSet:
    """Proxy object for operating on a set of Odoo records."""

    def __init__(self, connection: OdooConnection, model: str, ids: List[int]):
        self._conn = connection
        self._model = model
        self._ids = ids

    def read(self, fields: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        return self._conn.read(self._model, self._ids, fields)

    def write(self, values: Dict[str, Any]) -> bool:
        return self._conn.write(self._model, self._ids, values)

    def unlink(self) -> bool:
        return self._conn.unlink(self._model, self._ids)

    def __iter__(self):
        for record in self.read():
            yield OdooRecord(self._conn, self._model, record)

    def __len__(self) -> int:
        return len(self._ids)


class OdooRecord:
    """Proxy object for a single Odoo record."""

    def __init__(self, connection: OdooConnection, model: str, data: Dict[str, Any]):
        self._conn = connection
        self._model = model
        self._data = data

    def __getattr__(self, name: str) -> Any:
        if name.startswith("_"):
            return super().__getattribute__(name)
        return self._data.get(name)

    def __setattr__(self, name: str, value: Any) -> None:
        if name.startswith("_"):
            super().__setattr__(name, value)
        else:
            self._data[name] = value

    @property
    def id(self) -> int:
        return self._data.get("id", 0)

    def write(self, values: Optional[Dict[str, Any]] = None) -> bool:
        if values is None:
            values = {key: val for key, val in self._data.items() if key != "id"}
        return self._conn.write(self._model, [self.id], values)

    def unlink(self) -> bool:
        return self._conn.unlink(self._model, [self.id])

