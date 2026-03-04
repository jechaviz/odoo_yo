from __future__ import annotations

import time
import xmlrpc.client
from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass(slots=True)
class OdooCredentials:
    url: str
    db: str
    username: str
    password: str


class OdooClient:
    def __init__(self, creds: OdooCredentials):
        self.creds = creds
        self.common = xmlrpc.client.ServerProxy(f"{creds.url.rstrip('/')}/xmlrpc/2/common")
        self.models = xmlrpc.client.ServerProxy(f"{creds.url.rstrip('/')}/xmlrpc/2/object")
        self.uid: Optional[int] = None

    def connect(self) -> int:
        uid = self.common.authenticate(self.creds.db, self.creds.username, self.creds.password, {})
        if not uid:
            raise RuntimeError("Odoo authentication failed")
        self.uid = int(uid)
        return self.uid

    def _exec(self, model: str, method: str, *args: Any, **kwargs: Any) -> Any:
        if not self.uid:
            self.connect()
        retries = 4
        backoff_seconds = 1.0
        last_error: Optional[Exception] = None
        for _attempt in range(retries):
            try:
                return self.models.execute_kw(
                    self.creds.db,
                    self.uid,
                    self.creds.password,
                    model,
                    method,
                    list(args),
                    kwargs,
                )
            except xmlrpc.client.ProtocolError as exc:
                last_error = exc
                if int(getattr(exc, "errcode", 0)) not in {429, 503}:
                    raise
                time.sleep(backoff_seconds)
                backoff_seconds *= 2.0
        if last_error:
            raise last_error
        raise RuntimeError("Unexpected XML-RPC execution failure")

    def search_read(
        self,
        model: str,
        domain: List[Any],
        fields: Optional[List[str]] = None,
        limit: Optional[int] = None,
        order: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        params: Dict[str, Any] = {}
        if fields is not None:
            params["fields"] = fields
        if limit is not None:
            params["limit"] = limit
        if order is not None:
            params["order"] = order
        if context is not None:
            params["context"] = context
        return self._exec(model, "search_read", domain, **params)

    def search(
        self,
        model: str,
        domain: List[Any],
        limit: Optional[int] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> List[int]:
        params: Dict[str, Any] = {}
        if limit is not None:
            params["limit"] = limit
        if context is not None:
            params["context"] = context
        return self._exec(model, "search", domain, **params)

    def create(self, model: str, values: Dict[str, Any]) -> int:
        return int(self._exec(model, "create", values))

    def write(self, model: str, ids: List[int], values: Dict[str, Any]) -> bool:
        return bool(self._exec(model, "write", ids, values))

    def execute(self, model: str, method: str, *args: Any, **kwargs: Any) -> Any:
        return self._exec(model, method, *args, **kwargs)
