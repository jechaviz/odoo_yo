"""
Configuration Management Module
===============================
Handles loading and validation of configuration from multiple sources.
Implements the Singleton pattern for global configuration access.
"""

import os
from pathlib import Path
from typing import Any, Dict, Optional

import yaml

from lib.python.odoo_reusable.core.exceptions import ConfigurationError


class Configuration:
    """
    Configuration manager with support for multiple sources.

    Implements:
    - Singleton pattern for global access
    - Environment variable overrides
    - Configuration validation
    - Secrets management
    """

    _instance: Optional["Configuration"] = None
    _initialized: bool = False

    def __new__(cls, *args, **kwargs) -> "Configuration":
        """Implement Singleton pattern."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(
        self,
        settings_path: Optional[str] = None,
        secrets_path: Optional[str] = None,
    ):
        """
        Initialize configuration from files and environment.

        Args:
            settings_path: Path to settings.yaml file
            secrets_path: Path to secrets.yaml file
        """
        if self._initialized:
            return

        self._settings: Dict[str, Any] = {}
        self._secrets: Dict[str, Any] = {}
        self._runtime_overrides: Dict[str, Any] = {}
        self._base_path = Path(__file__).resolve().parents[4]

        self._load_settings(settings_path)
        self._load_secrets(secrets_path)
        self._apply_env_overrides()
        self._validate()

        self._initialized = True

    def _load_settings(self, settings_path: Optional[str] = None) -> None:
        """Load settings from YAML file."""
        if settings_path is None:
            settings_path = self._base_path / "config" / "settings.yaml"
        else:
            settings_path = Path(settings_path)

        if not settings_path.exists():
            raise ConfigurationError(
                f"Settings file not found: {settings_path}",
                config_key="settings_path",
            )

        with open(settings_path, "r", encoding="utf-8") as file_obj:
            self._settings = yaml.safe_load(file_obj) or {}

    def _load_secrets(self, secrets_path: Optional[str] = None) -> None:
        """Load secrets from YAML file."""
        if secrets_path is None:
            secrets_path = self._base_path / "config" / "secrets.yaml"
        else:
            secrets_path = Path(secrets_path)

        if secrets_path.exists():
            with open(secrets_path, "r", encoding="utf-8") as file_obj:
                self._secrets = yaml.safe_load(file_obj) or {}

    def _apply_env_overrides(self) -> None:
        """Apply environment variable overrides for secrets."""
        env_mappings = {
            "ODOO_USERNAME": ("odoo", "username"),
            "ODOO_PASSWORD": ("odoo", "password"),
            "ODOO_API_KEY": ("odoo", "api_key"),
            "ODOO_URL": ("odoo", "url"),
            "ODOO_DB": ("odoo", "db"),
        }

        for env_var, config_path in env_mappings.items():
            value = os.environ.get(env_var)
            if value:
                self._set_nested(self._secrets, config_path, value)

    def _set_nested(self, data: Dict[str, Any], path: tuple, value: Any) -> None:
        """Set a nested dictionary value."""
        for key in path[:-1]:
            data = data.setdefault(key, {})
        data[path[-1]] = value

    def _validate(self) -> None:
        """Validate required configuration values."""
        required_settings = [
            ("odoo", "url"),
            ("odoo", "db"),
        ]

        for path in required_settings:
            if not self._get_nested(self._settings, path):
                raise ConfigurationError(
                    f"Required configuration missing: {'.'.join(path)}",
                    config_key=".".join(path),
                )

        odoo_secrets = self._secrets.get("odoo", {})
        has_password = bool(odoo_secrets.get("password"))
        has_api_key = bool(odoo_secrets.get("api_key"))

        if not has_password and not has_api_key:
            raise ConfigurationError(
                "Odoo credentials not found. Set ODOO_PASSWORD or ODOO_API_KEY environment variable, "
                "or add them to secrets.yaml",
                config_key="odoo.credentials",
            )

    def _get_nested(self, data: Dict[str, Any], path: tuple) -> Any:
        """Get a nested dictionary value."""
        for key in path:
            if not isinstance(data, dict):
                return None
            data = data.get(key)
        return data

    def get(self, key: str, default: Any = None) -> Any:
        """
        Get a configuration value using dot notation.

        Args:
            key: Dot-separated key path (e.g., "odoo.url")
            default: Default value if key not found
        """
        path = tuple(key.split("."))

        value = self._get_nested(self._runtime_overrides, path)
        if value is not None:
            return value

        value = self._get_nested(self._settings, path)
        if value is not None:
            return value

        value = self._get_nested(self._secrets, path)
        if value is not None:
            return value

        return default

    def set_runtime_override(self, key: str, value: Any) -> None:
        """Set a runtime-only configuration override for the current process."""
        path = tuple(key.split("."))
        self._set_nested(self._runtime_overrides, path, value)

    @property
    def odoo_url(self) -> str:
        return self.get("odoo.url")

    @property
    def odoo_db(self) -> str:
        return self.get("odoo.db")

    @property
    def odoo_username(self) -> Optional[str]:
        return self.get("odoo.username")

    @property
    def odoo_password(self) -> Optional[str]:
        return self.get("odoo.password") or self.get("odoo.api_key")

    @property
    def odoo_endpoints(self) -> Dict[str, str]:
        return self.get("odoo.endpoints", {})

    @property
    def odoo_jsonrpc_endpoint(self) -> str:
        return self.get("odoo.jsonrpc_endpoint", "/jsonrpc")

    @property
    def odoo_verify_ssl(self) -> bool:
        return bool(self.get("odoo.verify_ssl", True))

    @property
    def files(self) -> Dict[str, str]:
        return self.get("files", {})

    @property
    def processing(self) -> Dict[str, Any]:
        return self.get("processing", {})

    @property
    def dry_run(self) -> bool:
        return self.get("processing.dry_run", False)

    @property
    def batch_size(self) -> int:
        return self.get("processing.batch_size", 100)

    @property
    def retry_attempts(self) -> int:
        return self.get("processing.retry_attempts", 3)

    @property
    def pricing_config(self) -> Dict[str, Any]:
        return self.get("pricing", {})

    @property
    def qc_config(self) -> Dict[str, Any]:
        return self.get("qc", {})

    def to_dict(self) -> Dict[str, Any]:
        """Export configuration as dictionary (excluding secret values)."""
        return {
            "settings": self._settings,
            "secrets_keys": list(self._secrets.keys()),
        }

    @classmethod
    def reset(cls) -> None:
        """Reset the singleton instance (useful for testing)."""
        cls._instance = None
        cls._initialized = False

