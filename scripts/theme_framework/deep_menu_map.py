from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

from odoo_bridge.cli_common import build_client


def parse_action(raw: str) -> tuple[str, int] | tuple[None, None]:
    text = str(raw or "").strip()
    if not text or "," not in text:
        return (None, None)
    model, _, raw_id = text.partition(",")
    try:
        return model.strip(), int(raw_id.strip())
    except ValueError:
        return (None, None)


def make_deeplink(menu_id: int, action_id: int | None) -> str:
    if action_id:
        return f"/odoo?menu_id={menu_id}&action={action_id}"
    return f"/odoo?menu_id={menu_id}"


def render_markdown(summary: dict, root_counter: Counter, fail_notes: list[str]) -> str:
    lines = [
        "# Deep Menu Map",
        "",
        f"- Generated: {summary['generated_at']}",
        f"- Host: {summary['host']}",
        f"- Total menus: {summary['total_menus']}",
        f"- Actionable menus: {summary['actionable_menus']}",
        f"- Root apps: {summary['root_apps']}",
        "",
        "## Menus by Root App",
        "",
        "| Root App | Menus |",
        "|---|---:|",
    ]
    for root, count in root_counter.most_common():
        lines.append(f"| {root} | {count} |")
    if fail_notes:
        lines.extend(["", "## Notes", ""])
        lines.extend([f"- {note}" for note in fail_notes])
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Export deep menu map and deeplinks")
    parser.add_argument("--allow-host", default="test1253.odoo.com")
    parser.add_argument("--allow-any-host", action="store_true")
    parser.add_argument("--out-dir", default="")
    args = parser.parse_args()

    client = build_client(args.allow_host, args.allow_any_host)
    host = client.creds.url

    menus = client.search_read(
        "ir.ui.menu",
        [],
        fields=["id", "name", "complete_name", "action", "parent_id", "sequence", "web_icon"],
        limit=5000,
        context={"active_test": False},
    )

    rows: list[dict] = []
    root_counter: Counter[str] = Counter()
    bad_action_rows: list[str] = []

    for menu in menus:
        menu_id = int(menu.get("id"))
        complete_name = str(menu.get("complete_name") or menu.get("name") or "")
        root = complete_name.split("/")[0].strip() if complete_name else "(root)"
        root_counter[root] += 1

        action_model, action_id = parse_action(str(menu.get("action") or ""))
        if menu.get("action") and not action_model:
            bad_action_rows.append(f"menu_id={menu_id} invalid action='{menu.get('action')}'")

        rows.append(
            {
                "id": menu_id,
                "name": menu.get("name"),
                "complete_name": complete_name,
                "root_app": root,
                "parent_id": menu.get("parent_id"),
                "sequence": menu.get("sequence"),
                "web_icon": menu.get("web_icon"),
                "action_raw": menu.get("action") or "",
                "action_model": action_model,
                "action_id": action_id,
                "deeplink": make_deeplink(menu_id, action_id),
                "is_actionable": bool(action_id),
            }
        )

    actionable = [r for r in rows if r["is_actionable"]]
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_dir = Path(args.out_dir) if args.out_dir else Path("docs/validations/theme_framework/test1253") / stamp
    out_dir.mkdir(parents=True, exist_ok=True)

    summary = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "host": host,
        "total_menus": len(rows),
        "actionable_menus": len(actionable),
        "root_apps": len(root_counter),
        "output_dir": str(out_dir.as_posix()),
    }

    (out_dir / "deep_menu_map.json").write_text(
        json.dumps({"summary": summary, "menus": rows}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (out_dir / "deep_menu_summary.md").write_text(
        render_markdown(summary, root_counter, bad_action_rows[:40]),
        encoding="utf-8",
    )
    (out_dir / "_meta.txt").write_text(
        f"deep_menu_map\n{summary['generated_at']}\n{summary['host']}\n", encoding="utf-8"
    )

    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

