from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

from odoo_yo_bridge.invoice_api_bridge import InvoiceApiBridgeManager
from odoo_yo_bridge.odoo_client import OdooClient, OdooCredentials


def _required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing env var: {name}")
    return value


def build_client() -> OdooClient:
    creds = OdooCredentials(
        url=_required_env("ODOO_URL"),
        db=_required_env("ODOO_DB"),
        username=_required_env("ODOO_USER"),
        password=_required_env("ODOO_PASS"),
    )
    client = OdooClient(creds)
    client.connect()
    return client


def main() -> int:
    parser = argparse.ArgumentParser(description="Setup YO Odoo invoice/complements/addenda API bridge")
    parser.add_argument("--project-root", default=str(Path(__file__).resolve().parents[2]))
    args = parser.parse_args()

    client = build_client()
    manager = InvoiceApiBridgeManager(client, project_root=Path(args.project_root))
    result = manager.run()
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result.get("status") == "ready" else 1


if __name__ == "__main__":
    raise SystemExit(main())
