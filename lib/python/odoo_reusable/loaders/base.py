"""
Base Data Loader - Abstract Base Class for Data Loading
========================================================
Defines the interface and common functionality for data loaders.
"""

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Dict, Generic, List, Optional, TypeVar

from lib.python.odoo_reusable.core.exceptions import DataLoadError

logger = logging.getLogger(__name__)

T = TypeVar("T")


@dataclass
class DataLoadResult(Generic[T]):
    """Result of a data loading operation."""

    data: List[T] = field(default_factory=list)
    errors: List[Dict[str, Any]] = field(default_factory=list)
    warnings: List[Dict[str, Any]] = field(default_factory=list)
    total_rows: int = 0
    successful_rows: int = 0
    failed_rows: int = 0

    @property
    def success(self) -> bool:
        return len(self.errors) == 0

    @property
    def success_rate(self) -> float:
        if self.total_rows == 0:
            return 0.0
        return (self.successful_rows / self.total_rows) * 100

    def add_error(
        self,
        row_number: int,
        message: str,
        field: Optional[str] = None,
        value: Optional[Any] = None,
    ) -> None:
        self.errors.append(
            {
                "row": row_number,
                "message": message,
                "field": field,
                "value": str(value) if value is not None else None,
            }
        )
        self.failed_rows += 1

    def add_warning(
        self,
        row_number: int,
        message: str,
        field: Optional[str] = None,
    ) -> None:
        self.warnings.append(
            {
                "row": row_number,
                "message": message,
                "field": field,
            }
        )

    def add_success(self, data: T) -> None:
        self.data.append(data)
        self.successful_rows += 1

    def to_dict(self) -> dict:
        return {
            "total_rows": self.total_rows,
            "successful_rows": self.successful_rows,
            "failed_rows": self.failed_rows,
            "success_rate": round(self.success_rate, 2),
            "error_count": len(self.errors),
            "warning_count": len(self.warnings),
            "errors": self.errors[:10],
            "warnings": self.warnings[:10],
        }


class DataLoader(ABC, Generic[T]):
    """Abstract base class for data loaders."""

    def __init__(
        self,
        file_path: str,
        validator: Optional[Callable[[Dict[str, Any]], bool]] = None,
        transformer: Optional[Callable[[Dict[str, Any]], T]] = None,
    ):
        self.file_path = Path(file_path)
        self.validator = validator
        self.transformer = transformer
        self._raw_data: List[Dict[str, Any]] = []

    def load(self) -> DataLoadResult[T]:
        """Load data from the file."""
        result = DataLoadResult[T]()

        if not self.file_path.exists():
            raise DataLoadError(
                f"File not found: {self.file_path}",
                file_path=str(self.file_path),
            )

        try:
            self._raw_data = self._read_file()
            result.total_rows = len(self._raw_data)
            logger.info("Read %s rows from %s", result.total_rows, self.file_path)
        except DataLoadError:
            raise
        except Exception as exc:
            raise DataLoadError(
                f"Failed to read file: {exc}",
                file_path=str(self.file_path),
                original_error=exc,
            )

        for row_number, row in enumerate(self._raw_data, start=1):
            try:
                if self._is_empty_row(row):
                    continue

                if self.validator and not self.validator(row):
                    result.add_error(row_number, "Validation failed", value=row)
                    continue

                data = self.transformer(row) if self.transformer else self._transform_row(row)  # type: ignore[arg-type]
                result.add_success(data)
            except Exception as exc:
                result.add_error(row_number, f"Processing error: {exc}", value=row)
                logger.debug("Row %s error: %s", row_number, exc)

        logger.info(
            "Loaded %s/%s records (%.1f%% success rate)",
            result.successful_rows,
            result.total_rows,
            result.success_rate,
        )
        return result

    @abstractmethod
    def _read_file(self) -> List[Dict[str, Any]]:
        """Read the file and return raw row dictionaries."""

    @abstractmethod
    def _transform_row(self, row: Dict[str, Any]) -> T:
        """Transform one raw row into the target object."""

    def _is_empty_row(self, row: Dict[str, Any]) -> bool:
        if not row:
            return True
        for value in row.values():
            if value is not None and str(value).strip():
                return False
        return True

    def get_raw_data(self) -> List[Dict[str, Any]]:
        return self._raw_data

    @staticmethod
    def clean_string(value: Any) -> str:
        if value is None:
            return ""
        return str(value).strip()

    @staticmethod
    def clean_float(value: Any) -> float:
        if value is None:
            return 0.0
        clean = str(value).replace("$", "").replace(",", "").strip()
        try:
            return float(clean) if clean else 0.0
        except ValueError:
            return 0.0

    @staticmethod
    def clean_int(value: Any) -> int:
        if value is None:
            return 0
        clean = str(value).replace(",", "").strip()
        try:
            return int(float(clean)) if clean else 0
        except ValueError:
            return 0


class DataLoaderFactory:
    """Factory for creating data loaders."""

    _loaders: Dict[str, type] = {}

    @classmethod
    def register(cls, extension: str, loader_class: type) -> None:
        cls._loaders[extension.lower()] = loader_class

    @classmethod
    def create(
        cls,
        file_path: str,
        validator: Optional[Callable] = None,
        transformer: Optional[Callable] = None,
    ) -> DataLoader:
        extension = Path(file_path).suffix.lower().lstrip(".")
        if extension not in cls._loaders:
            raise ValueError(f"No loader registered for extension: {extension}")
        loader_class = cls._loaders[extension]
        return loader_class(file_path, validator, transformer)  # type: ignore[call-arg]

