from __future__ import annotations

import argparse
import ast
import hashlib
import json
import re
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

ASSET_EXTENSIONS = {".scss", ".css", ".js", ".xml"}
COLOR_PATTERN = re.compile(r"#[0-9a-fA-F]{3,8}\b|rgba?\([^\)]+\)|hsla?\([^\)]+\)")
SELECTOR_PATTERN = re.compile(r"(\.[A-Za-z0-9_\-]+\s*[,{])")


@dataclass(slots=True)
class ThemeModule:
    source_root: Path
    module_root: Path
    module_name: str
    manifest_path: Path
    manifest_data: dict


def _clean_manifest(raw: str) -> str:
    lines = []
    for line in raw.splitlines():
        stripped = line.strip()
        if stripped.startswith("#"):
            continue
        lines.append(line)
    return "\n".join(lines)


def _parse_manifest(path: Path) -> dict:
    content = _clean_manifest(path.read_text(encoding="utf-8", errors="ignore"))
    start = content.find("{")
    end = content.rfind("}")
    if start < 0 or end <= start:
        raise RuntimeError(f"Manifest parse failed: {path}")
    payload = content[start : end + 1]
    return ast.literal_eval(payload)


def _iter_theme_modules(themes_root: Path) -> Iterable[ThemeModule]:
    for source_root in sorted([p for p in themes_root.iterdir() if p.is_dir()]):
        for module_root in sorted([p for p in source_root.iterdir() if p.is_dir()]):
            manifest = module_root / "__manifest__.py"
            if not manifest.exists():
                continue
            try:
                manifest_data = _parse_manifest(manifest)
            except Exception:
                continue
            yield ThemeModule(
                source_root=source_root,
                module_root=module_root,
                module_name=module_root.name,
                manifest_path=manifest,
                manifest_data=manifest_data,
            )


def _flatten_assets(raw_assets) -> list[str]:
    if isinstance(raw_assets, dict):
        out: list[str] = []
        for value in raw_assets.values():
            out.extend(_flatten_assets(value))
        return out
    if isinstance(raw_assets, (set, tuple, list)):
        out: list[str] = []
        for item in raw_assets:
            out.extend(_flatten_assets(item))
        return out
    if isinstance(raw_assets, str):
        return [raw_assets]
    return []


def _normalize_asset_path(asset: str, module_name: str) -> str:
    value = str(asset).strip().replace("\\", "/")
    if value.startswith("http://") or value.startswith("https://"):
        return value
    value = value.lstrip("/")
    prefix = f"{module_name}/"
    if value.startswith(prefix):
        value = value[len(prefix) :]
    return value


def _digest(path: Path) -> str:
    sha1 = hashlib.sha1()
    sha1.update(path.read_bytes())
    return sha1.hexdigest()


def _collect_patterns(path: Path) -> tuple[list[str], list[str]]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    colors = COLOR_PATTERN.findall(text)
    selectors = []
    for match in SELECTOR_PATTERN.finditer(text):
        token = match.group(1).strip().rstrip("{,")
        if token.startswith(".o_") or token.startswith(".o-") or token.startswith(".sidebar"):
            selectors.append(token)
    return colors, selectors


def run(themes_root: Path, output_root: Path) -> dict:
    output_root.mkdir(parents=True, exist_ok=True)
    modules_out: list[dict] = []
    all_colors: list[str] = []
    all_selectors: list[str] = []

    for mod in _iter_theme_modules(themes_root):
        assets = mod.manifest_data.get("assets") or {}
        backend_assets = _flatten_assets((assets or {}).get("web.assets_backend", []))
        copied_assets: list[dict] = []
        module_target = output_root / mod.module_name
        if module_target.exists():
            shutil.rmtree(module_target)
        module_target.mkdir(parents=True, exist_ok=True)

        for raw_asset in backend_assets:
            normalized = _normalize_asset_path(raw_asset, mod.module_name)
            if normalized.startswith("http://") or normalized.startswith("https://"):
                copied_assets.append({"source": raw_asset, "kind": "remote"})
                continue
            source_path = mod.module_root / normalized
            if not source_path.exists() or source_path.suffix.lower() not in ASSET_EXTENSIONS:
                continue
            relative_target = Path(normalized)
            target_path = module_target / relative_target
            target_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source_path, target_path)

            colors, selectors = _collect_patterns(source_path)
            all_colors.extend(colors)
            all_selectors.extend(selectors)
            copied_assets.append(
                {
                    "source": str(source_path.as_posix()),
                    "target": str(target_path.as_posix()),
                    "sha1": _digest(target_path),
                    "size": target_path.stat().st_size,
                    "colors": len(colors),
                    "selectors": len(selectors),
                }
            )

        modules_out.append(
            {
                "module": mod.module_name,
                "source_root": str(mod.source_root.as_posix()),
                "manifest": str(mod.manifest_path.as_posix()),
                "manifest_name": mod.manifest_data.get("name", mod.module_name),
                "version": str(mod.manifest_data.get("version", "")),
                "depends": list(mod.manifest_data.get("depends", []) or []),
                "backend_assets_declared": len(backend_assets),
                "backend_assets_copied": len([a for a in copied_assets if a.get("kind") != "remote"]),
                "remote_assets": [a for a in copied_assets if a.get("kind") == "remote"],
                "assets": copied_assets,
            }
        )

    color_freq: dict[str, int] = {}
    for color in all_colors:
        key = color.strip().lower()
        color_freq[key] = color_freq.get(key, 0) + 1

    selector_freq: dict[str, int] = {}
    for selector in all_selectors:
        key = selector.strip()
        selector_freq[key] = selector_freq.get(key, 0) + 1

    summary = {
        "themes_root": str(themes_root.as_posix()),
        "output_root": str(output_root.as_posix()),
        "modules": modules_out,
        "totals": {
            "modules": len(modules_out),
            "assets_copied": sum(m["backend_assets_copied"] for m in modules_out),
            "remote_assets": sum(len(m["remote_assets"]) for m in modules_out),
        },
        "top_colors": sorted(color_freq.items(), key=lambda kv: kv[1], reverse=True)[:80],
        "top_selectors": sorted(selector_freq.items(), key=lambda kv: kv[1], reverse=True)[:160],
    }

    (output_root / "_summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    md_lines = [
        "# External Theme Import Summary",
        "",
        f"- Source: `{themes_root.as_posix()}`",
        f"- Modules: **{summary['totals']['modules']}**",
        f"- Backend assets copied: **{summary['totals']['assets_copied']}**",
        f"- Remote assets declared: **{summary['totals']['remote_assets']}**",
        "",
        "## Modules",
        "",
        "| Module | Version | Declared | Copied |",
        "|---|---|---:|---:|",
    ]
    for module in modules_out:
        md_lines.append(
            f"| {module['module']} | {module['version']} | {module['backend_assets_declared']} | {module['backend_assets_copied']} |"
        )
    md_lines.extend(["", "## Top Colors", "", "| Color | Count |", "|---|---:|"])
    for color, count in summary["top_colors"][:40]:
        md_lines.append(f"| `{color}` | {count} |")
    md_lines.extend(["", "## Top Selectors", "", "| Selector | Count |", "|---|---:|"])
    for selector, count in summary["top_selectors"][:80]:
        md_lines.append(f"| `{selector}` | {count} |")

    (output_root / "_summary.md").write_text("\n".join(md_lines), encoding="utf-8")
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(description="Import external Odoo backend themes for local reuse")
    parser.add_argument("--themes-root", default="C:/git/odoo/themes")
    parser.add_argument("--output-root", default="data/theme_framework/vendor/imported")
    args = parser.parse_args()

    summary = run(Path(args.themes_root), Path(args.output_root))
    print(json.dumps(summary["totals"], ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
