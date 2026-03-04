"""
Reusable Exceptions for Odoo Setup Tooling
==========================================
Defines a hierarchy of exceptions for configuration, IO, and Odoo operations.
"""

from typing import Any, Optional


class RPRentalError(Exception):
    """
    Base exception for automation errors.
    """

    def __init__(self, message: str, details: Optional[dict] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

    def __str__(self) -> str:
        if self.details:
            return f"{self.message} | Details: {self.details}"
        return self.message

    def to_dict(self) -> dict:
        """Serialize exception to dictionary for logging/API responses."""
        return {
            "error_type": self.__class__.__name__,
            "message": self.message,
            "details": self.details,
        }


class ConfigurationError(RPRentalError):
    """Raised when there's an issue with configuration."""

    def __init__(self, message: str, config_key: Optional[str] = None):
        details = {"config_key": config_key} if config_key else {}
        super().__init__(message, details)


class OdooConnectionError(RPRentalError):
    """Raised when connection to Odoo fails."""

    def __init__(
        self,
        message: str,
        url: Optional[str] = None,
        db: Optional[str] = None,
        original_error: Optional[Exception] = None,
    ):
        details = {
            "url": url,
            "db": db,
            "original_error": str(original_error) if original_error else None,
        }
        super().__init__(message, details)


class ValidationError(RPRentalError):
    """Raised when data validation fails."""

    def __init__(
        self,
        message: str,
        field: Optional[str] = None,
        value: Optional[Any] = None,
        constraints: Optional[dict] = None,
    ):
        details = {
            "field": field,
            "value": str(value) if value is not None else None,
            "constraints": constraints,
        }
        super().__init__(message, details)


class DataLoadError(RPRentalError):
    """Raised when data loading from files fails."""

    def __init__(
        self,
        message: str,
        file_path: Optional[str] = None,
        sheet_name: Optional[str] = None,
        row_number: Optional[int] = None,
        original_error: Optional[Exception] = None,
    ):
        details = {
            "file_path": file_path,
            "sheet_name": sheet_name,
            "row_number": row_number,
            "original_error": str(original_error) if original_error else None,
        }
        super().__init__(message, details)


class OperationError(RPRentalError):
    """Raised when an Odoo operation fails."""

    def __init__(
        self,
        message: str,
        model: Optional[str] = None,
        operation: Optional[str] = None,
        record_id: Optional[int] = None,
        original_error: Optional[Exception] = None,
    ):
        details = {
            "model": model,
            "operation": operation,
            "record_id": record_id,
            "original_error": str(original_error) if original_error else None,
        }
        super().__init__(message, details)


class AuthenticationError(OdooConnectionError):
    """Raised when authentication with Odoo fails."""


class RateLimitError(RPRentalError):
    """Raised when API rate limit is exceeded."""

    def __init__(self, message: str, retry_after: Optional[int] = None):
        details = {"retry_after": retry_after}
        super().__init__(message, details)


class NotFoundError(RPRentalError):
    """Raised when a requested resource is not found."""

    def __init__(
        self,
        message: str,
        resource_type: Optional[str] = None,
        identifier: Optional[str] = None,
    ):
        details = {"resource_type": resource_type, "identifier": identifier}
        super().__init__(message, details)
