from __future__ import annotations

import argparse
import json
from pathlib import Path

from odoo_bridge.cli_common import build_client
from odoo_bridge.theme_framework.manager import ThemeFrameworkManager


def _parse_theme_list(raw: str) -> list[str]:
    return [item.strip() for item in str(raw or "").split(",") if item.strip()]


def main() -> int:
    parser = argparse.ArgumentParser(description="Generic backend theme framework manager")
    parser.add_argument("--project-root", default=str(Path(__file__).resolve().parents[2]))
    parser.add_argument("--allow-host", default="jesus-chavez-galaviz.odoo.com")
    parser.add_argument("--allow-any-host", action="store_true")
    parser.add_argument(
        "--themes",
        default="",
        help="Comma-separated theme keys. Empty means catalog-driven default scope.",
    )
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--status", action="store_true", help="Read framework status")
    mode.add_argument("--rollback", action="store_true", help="Rollback deployed themes")
    args = parser.parse_args()

    client = build_client(args.allow_host, args.allow_any_host)
    manager = ThemeFrameworkManager(client=client, project_root=Path(args.project_root))
    themes = _parse_theme_list(args.themes)

    if args.status:
        result = manager.status()
    elif args.rollback:
        result = manager.rollback(themes)
    else:
        result = manager.apply(themes)

    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result.get("status") in {"ready", "ok", "rolled_back"} else 1


if __name__ == "__main__":
    raise SystemExit(main())

