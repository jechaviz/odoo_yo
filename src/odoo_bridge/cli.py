from __future__ import annotations

import argparse
import json
from pathlib import Path

from odoo_bridge.cli_common import build_client
from odoo_bridge.invoice_api.manager import InvoiceApiBridgeManager


def main() -> int:
    parser = argparse.ArgumentParser(description="Setup Odoo invoice/complements/addenda API bridge")
    parser.add_argument("--project-root", default=str(Path(__file__).resolve().parents[2]))
    parser.add_argument("--allow-host", default="jesus-chavez-galaviz.odoo.com")
    parser.add_argument("--allow-any-host", action="store_true")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--status", action="store_true", help="Read current bridge artifacts")
    mode.add_argument("--rollback", action="store_true", help="Delete bridge artifacts")
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
