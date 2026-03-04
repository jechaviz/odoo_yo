"""
Base Classes Module
===================
Provides abstract base classes for repositories and services.
"""

import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, Generic, List, Optional, TypeVar

from lib.python.odoo_reusable.core.config import Configuration
from lib.python.odoo_reusable.core.connection import OdooConnection

logger = logging.getLogger(__name__)

T = TypeVar("T")


class BaseRepository(ABC, Generic[T]):
    """Abstract base class for Odoo model repositories."""

    _model_name: str = ""
    _fields: List[str] = []

    def __init__(self, connection: OdooConnection):
        if not self._model_name:
            raise ValueError(f"Model name not defined for {self.__class__.__name__}")
        self._conn = connection
        self._config = Configuration()

    def search(
        self,
        domain: List,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        order: Optional[str] = None,
    ) -> List[int]:
        return self._conn.search(
            self._model_name,
            domain,
            limit=limit,
            offset=offset,
            order=order,
        )

    def search_read(
        self,
        domain: List,
        fields: Optional[List[str]] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        order: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        return self._conn.search_read(
            self._model_name,
            domain,
            fields=fields or self._fields,
            limit=limit,
            offset=offset,
            order=order,
        )

    def read(self, ids: List[int], fields: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        if not ids:
            return []
        return self._conn.read(self._model_name, ids, fields=fields or self._fields)

    def read_one(self, record_id: int, fields: Optional[List[str]] = None) -> Optional[Dict[str, Any]]:
        records = self.read([record_id], fields)
        return records[0] if records else None

    def create(self, values: Dict[str, Any]) -> int:
        self._validate_create(values)
        if self._config.dry_run:
            logger.info("[DRY RUN] Would create %s: %s", self._model_name, values)
            return -1
        record_id = self._conn.create(self._model_name, values)
        logger.info("Created %s ID: %s", self._model_name, record_id)
        return record_id

    def create_batch(self, values_list: List[Dict[str, Any]]) -> List[int]:
        ids = []
        for values in values_list:
            ids.append(self.create(values))
        return ids

    def write(self, ids: List[int], values: Dict[str, Any]) -> bool:
        self._validate_write(values)
        if self._config.dry_run:
            logger.info("[DRY RUN] Would update %s IDs %s: %s", self._model_name, ids, values)
            return True
        result = self._conn.write(self._model_name, ids, values)
        logger.info("Updated %s IDs: %s", self._model_name, ids)
        return result

    def write_one(self, record_id: int, values: Dict[str, Any]) -> bool:
        return self.write([record_id], values)

    def unlink(self, ids: List[int]) -> bool:
        if self._config.dry_run:
            logger.info("[DRY RUN] Would delete %s IDs: %s", self._model_name, ids)
            return True
        result = self._conn.unlink(self._model_name, ids)
        logger.info("Deleted %s IDs: %s", self._model_name, ids)
        return result

    def unlink_one(self, record_id: int) -> bool:
        return self.unlink([record_id])

    def exists(self, record_id: int) -> bool:
        return bool(self.search([("id", "=", record_id)], limit=1))

    def count(self, domain: List) -> int:
        return len(self.search(domain))

    def get_or_create(self, domain: List, values: Dict[str, Any]) -> tuple:
        ids = self.search(domain, limit=1)
        if ids:
            return ids[0], False
        return self.create(values), True

    @abstractmethod
    def _validate_create(self, values: Dict[str, Any]) -> None:
        """Validate values before creation."""

    @abstractmethod
    def _validate_write(self, values: Dict[str, Any]) -> None:
        """Validate values before update."""

    @abstractmethod
    def to_dto(self, record: Dict[str, Any]) -> T:
        """Convert record dictionary to DTO."""

    @abstractmethod
    def from_dto(self, dto: T) -> Dict[str, Any]:
        """Convert DTO to record dictionary."""


class BaseService(ABC):
    """Abstract base class for business services."""

    def __init__(self, connection: Optional[OdooConnection] = None):
        self._conn = connection
        self._config = Configuration()

    @property
    def connection(self) -> OdooConnection:
        if self._conn is None:
            self._conn = OdooConnection(self._config)
        return self._conn

    @connection.setter
    def connection(self, value: OdooConnection) -> None:
        self._conn = value

    def execute_in_transaction(self, operations: List[Dict[str, Any]]) -> List[Any]:
        results = []
        for operation in operations:
            model = operation["model"]
            method = operation["method"]
            args = operation.get("args", [])
            kwargs = operation.get("kwargs", {})
            results.append(self.connection.execute(model, method, *args, **kwargs))
        return results


class SingletonMeta(type):
    """Metaclass implementing the Singleton pattern."""

    _instances: Dict[type, Any] = {}

    def __call__(cls, *args, **kwargs) -> Any:
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

    @classmethod
    def reset(cls, target_cls: type) -> None:
        if target_cls in cls._instances:
            del cls._instances[target_cls]


class Registry:
    """Service registry for dependency injection."""

    _services: Dict[str, Any] = {}
    _repositories: Dict[str, Any] = {}

    @classmethod
    def register_service(cls, name: str, service: Any) -> None:
        cls._services[name] = service

    @classmethod
    def get_service(cls, name: str) -> Any:
        if name not in cls._services:
            raise KeyError(f"Service not registered: {name}")
        return cls._services[name]

    @classmethod
    def register_repository(cls, name: str, repository: Any) -> None:
        cls._repositories[name] = repository

    @classmethod
    def get_repository(cls, name: str) -> Any:
        if name not in cls._repositories:
            raise KeyError(f"Repository not registered: {name}")
        return cls._repositories[name]

    @classmethod
    def clear(cls) -> None:
        cls._services.clear()
        cls._repositories.clear()

