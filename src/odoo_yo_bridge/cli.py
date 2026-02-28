from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from urllib.parse import urlparse

from odoo_yo_bridge.invoice_api_bridge import InvoiceApiBridgeManager
from odoo_yo_bridge.odoo_client import OdooClient, OdooCredentials


def _required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing env var: {name}")
    return value


def build_client(allow_host: str, allow_any_host: bool) -> OdooClient:
    creds = OdooCredentials(
        url=_required_env("ODOO_URL"),
        db=_required_env("ODOO_DB"),
        username=_required_env("ODOO_USER"),
        password=_required_env("ODOO_PASS"),
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


def main() -> int:
    parser = argparse.ArgumentParser(description="Setup YO Odoo invoice/complements/addenda API bridge")
    parser.add_argument("--project-root", default=str(Path(__file__).resolve().parents[2]))
    parser.add_argument("--allow-host", default="jesus-chavez-galaviz.odoo.com")
    parser.add_argument("--allow-any-host", action="store_true")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--status", action="store_true", help="Read current YO bridge artifacts")
    mode.add_argument("--rollback", action="store_true", help="Delete YO bridge artifacts")
    args = parser.parse_args()

    client = build_client(args.allow_host, args.allow_any_host)
    manager = InvoiceApiBridgeManager(client, project_root=Path(args.project_root))

    if args.status:
        result = manager.status()
    elif args.rollback:
        result = manager.rollback()
    else:
        result = manager.run()

    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result.get("status") in {"ready", "ok", "rolled_back"} else 1


if __name__ == "__main__":
    raise SystemExit(main())
