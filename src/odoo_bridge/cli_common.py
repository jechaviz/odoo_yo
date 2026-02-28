from __future__ import annotations

import os
from urllib.parse import urlparse

from odoo_bridge.odoo_client import OdooClient, OdooCredentials


def required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing env var: {name}")
    return value


def build_client(allow_host: str, allow_any_host: bool) -> OdooClient:
    creds = OdooCredentials(
        url=required_env("ODOO_URL"),
        db=required_env("ODOO_DB"),
        username=required_env("ODOO_USER"),
        password=required_env("ODOO_PASS"),
    )
    host = (urlparse(creds.url).hostname or "").strip().lower()
    expected_host = (allow_host or "").strip().lower()
    if not allow_any_host and expected_host and host != expected_host:
        raise RuntimeError(
            f"Blocked target host '{host}'. Expected '{expected_host}'. "
            "Use --allow-any-host only when intentional."
        )
    client = OdooClient(creds)
    client.connect()
    return client
