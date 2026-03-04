from __future__ import annotations

import base64
import hashlib
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Set
from urllib.parse import urlparse

from odoo_bridge.odoo_client import OdooClient
from odoo_bridge.theme_framework.catalog_loader import ThemeCatalogLoader
from odoo_bridge.theme_framework.contracts import ThemeCatalogSpec, ThemeQWebViewSpec, ThemeSpec


@dataclass(frozen=True)
class ThemeFrameworkConfig:
    catalog_paths: tuple[Path, ...] = (Path("data/theme_framework/catalogs/base.yml"),)
    active_param_key: str = "theme_framework.active_themes"
    version_param_key: str = "theme_framework.catalog_version"
    asset_prefix: str = "[ThemeFW]"
    view_key_prefix: str = "theme_framework."


class ThemeFrameworkManager:
    def __init__(
        self,
        client: OdooClient,
        project_root: Path,
        config: Optional[ThemeFrameworkConfig] = None,
    ):
        self.client = client
        self.project_root = project_root
        self.config = config or ThemeFrameworkConfig()
        self.catalog_loader = ThemeCatalogLoader(project_root=project_root)
        self._field_exists_cache: Dict[tuple[str, str], bool] = {}

    def apply(self, selected_themes: Optional[Iterable[str]] = None) -> Dict[str, Any]:
        catalog = self.catalog_loader.load_many(self.config.catalog_paths)
        requested = [item.strip() for item in (selected_themes or []) if str(item).strip()]
        theme_keys = requested or sorted(catalog.themes.keys())
        host = self._current_host()

        deployed = []
        skipped = []
        for key in theme_keys:
            theme = catalog.themes.get(key)
            if not theme:
                skipped.append({"key": key, "reason": "not_found"})
                continue
            if theme.hosts and host not in theme.hosts:
                skipped.append({"key": key, "reason": f"host_mismatch:{host}"})
                continue
            resolved = self._resolve_theme(theme, catalog, seen=None)
            payload = self._deploy_theme(resolved)
            deployed.append(payload)

        active_keys = [item["key"] for item in deployed]
        self._upsert_param(self.config.active_param_key, json.dumps(active_keys, ensure_ascii=False))
        self._upsert_param(self.config.version_param_key, str(catalog.version))

        return {
            "status": "ready",
            "catalog_version": catalog.version,
            "host": host,
            "deployed": deployed,
            "skipped": skipped,
            "active_themes": active_keys,
        }

    def rollback(self, selected_themes: Optional[Iterable[str]] = None) -> Dict[str, Any]:
        catalog = self.catalog_loader.load_many(self.config.catalog_paths)
        requested = [item.strip() for item in (selected_themes or []) if str(item).strip()]
        theme_keys = requested or sorted(catalog.themes.keys())
        removed_assets = 0
        removed_views = 0
        removed_params = 0

        for key in theme_keys:
            removed_assets += self._deactivate_theme_assets(key)
            removed_views += self._deactivate_theme_views(key)
            removed_params += self._remove_theme_params(catalog.themes.get(key))

        self._upsert_param(self.config.active_param_key, "[]")
        return {
            "status": "rolled_back",
            "themes": theme_keys,
            "assets_deactivated": removed_assets,
            "views_deactivated": removed_views,
            "theme_params_removed": removed_params,
        }

    def status(self) -> Dict[str, Any]:
        params = self.client.search_read(
            "ir.config_parameter",
            [("key", "in", [self.config.active_param_key, self.config.version_param_key])],
            fields=["id", "key", "value"],
            limit=10,
        )
        active_value = next(
            (str(item.get("value") or "[]") for item in params if item.get("key") == self.config.active_param_key),
            "[]",
        )
        try:
            active_themes = json.loads(active_value)
            if not isinstance(active_themes, list):
                active_themes = []
        except json.JSONDecodeError:
            active_themes = []

        active_theme_list = [str(item) for item in active_themes if str(item).strip()]
        assets = self.client.search_read(
            "ir.asset",
            [("name", "ilike", f"{self.config.asset_prefix}%")],
            fields=["id", "name", "bundle", "active", "sequence"],
            limit=500,
        )
        views = self.client.search_read(
            "ir.ui.view",
            [("key", "ilike", f"{self.config.view_key_prefix}%")],
            fields=["id", "name", "key", "active", "priority"],
            limit=500,
        )
        return {
            "status": "ok",
            "host": self._current_host(),
            "active_themes": active_theme_list,
            "params": params,
            "assets": assets,
            "views": views,
        }

    def _resolve_theme(
        self,
        theme: ThemeSpec,
        catalog: ThemeCatalogSpec,
        seen: Optional[Set[str]],
    ) -> ThemeSpec:
        path = set(seen or set())
        if theme.key in path:
            raise RuntimeError(f"Cyclic theme inheritance detected for: {theme.key}")
        next_path = set(path)
        next_path.add(theme.key)

        inherited_assets = []
        inherited_views = []
        inherited_params: Dict[str, str] = {}
        inherited_hosts = []
        for parent_key in theme.inherits:
            parent = catalog.themes.get(parent_key)
            if not parent:
                raise RuntimeError(f"Theme '{theme.key}' inherits unknown parent '{parent_key}'")
            resolved_parent = self._resolve_theme(parent, catalog, next_path)
            inherited_assets.extend(resolved_parent.assets)
            inherited_views.extend(resolved_parent.qweb_views)
            inherited_params.update(resolved_parent.params)
            inherited_hosts.extend(resolved_parent.hosts)

        merged_assets = tuple(inherited_assets + list(theme.assets))
        merged_views = tuple(inherited_views + list(theme.qweb_views))
        merged_params = dict(inherited_params)
        merged_params.update(theme.params)
        merged_hosts = tuple(dict.fromkeys([*inherited_hosts, *theme.hosts]).keys())
        return ThemeSpec(
            key=theme.key,
            title=theme.title,
            description=theme.description,
            inherits=theme.inherits,
            assets=merged_assets,
            qweb_views=merged_views,
            params=merged_params,
            hosts=merged_hosts,
        )

    def _deploy_theme(self, theme: ThemeSpec) -> Dict[str, Any]:
        asset_count = 0
        view_count = 0
        for asset in theme.assets:
            self._upsert_asset(theme.key, asset.name, asset.path, asset.bundle, asset.directive, asset.sequence, asset.mimetype)
            asset_count += 1
        for view in theme.qweb_views:
            self._upsert_qweb_view(theme.key, view)
            view_count += 1
        for key, value in theme.params.items():
            self._upsert_param(key, value)
        return {
            "key": theme.key,
            "title": theme.title,
            "assets": asset_count,
            "qweb_views": view_count,
            "params": sorted(theme.params.keys()),
        }

    def _upsert_asset(
        self,
        theme_key: str,
        asset_name: str,
        relative_path: Path,
        bundle: str,
        directive: str,
        sequence: int,
        mimetype: str,
    ) -> None:
        absolute_path = self._resolve_file(relative_path)
        if not absolute_path.exists():
            raise RuntimeError(f"Theme asset not found: {absolute_path}")

        content = absolute_path.read_bytes()
        checksum = hashlib.sha1(content).hexdigest()
        encoded_content = base64.b64encode(content).decode("ascii")
        attachment_name = f"{self.config.asset_prefix}:{theme_key}:attachment:{relative_path.as_posix()}"
        attachment_id = self._upsert_attachment(attachment_name, absolute_path.name, encoded_content, mimetype)
        web_path = f"/web/content/{attachment_id}?download=false&unique={checksum}"

        ir_asset_name = f"{self.config.asset_prefix}:{theme_key}:{asset_name}"
        existing = self.client.search(
            "ir.asset",
            [("name", "=", ir_asset_name), ("bundle", "=", bundle)],
            context={"active_test": False},
        )
        values = {
            "name": ir_asset_name,
            "bundle": bundle,
            "path": web_path,
            "directive": directive,
            "sequence": sequence,
            "active": True,
        }
        if existing:
            canonical_id = int(sorted(existing)[0])
            self.client.write("ir.asset", [canonical_id], values)
            extra_ids = [int(item) for item in existing if int(item) != canonical_id]
            if extra_ids:
                self.client.write("ir.asset", extra_ids, {"active": False})
            return
        self.client.create("ir.asset", values)

    def _upsert_attachment(
        self,
        name: str,
        filename: str,
        encoded_content: str,
        mimetype: str,
    ) -> int:
        existing = self.client.search_read(
            "ir.attachment",
            [("name", "=", name), ("type", "=", "binary")],
            fields=["id", "checksum"],
            limit=1,
        )
        values = {
            "name": name,
            "type": "binary",
            "datas": encoded_content,
            "mimetype": mimetype,
        }
        if self._field_exists("ir.attachment", "datas_fname"):
            values["datas_fname"] = filename
        if self._field_exists("ir.attachment", "public"):
            values["public"] = True
        if existing:
            attachment_id = int(existing[0]["id"])
            self.client.write("ir.attachment", [attachment_id], values)
            return attachment_id
        return self.client.create("ir.attachment", values)

    def _upsert_qweb_view(self, theme_key: str, view: ThemeQWebViewSpec) -> int:
        inherit_id = self._find_qweb_inherit_id(view.inherit_key) if view.inherit_key else None
        arch_db = view.arch_inline or self._read_text(view.arch_path)
        key = f"{self.config.view_key_prefix}{theme_key}.{self._slug(view.name)}"
        values: Dict[str, Any] = {
            "name": f"{self.config.asset_prefix}:{theme_key}:{view.name}",
            "type": "qweb",
            "mode": view.mode,
            "priority": int(view.priority),
            "arch_db": arch_db,
            "active": True,
            "key": key,
        }
        if inherit_id:
            values["inherit_id"] = inherit_id
        existing = self.client.search(
            "ir.ui.view",
            [("key", "=", key), ("type", "=", "qweb")],
            context={"active_test": False},
        )
        if existing:
            view_id = int(sorted(existing)[0])
            self.client.write("ir.ui.view", [view_id], values)
            extra_ids = [int(item) for item in existing if int(item) != view_id]
            if extra_ids:
                self.client.write("ir.ui.view", extra_ids, {"active": False})
            return view_id
        return self.client.create("ir.ui.view", values)

    def _find_qweb_inherit_id(self, inherit_key: str) -> int:
        rows = self.client.search_read(
            "ir.ui.view",
            [("type", "=", "qweb"), ("key", "=", inherit_key)],
            fields=["id"],
            limit=1,
        )
        if not rows or not rows[0].get("id"):
            fallback_name = inherit_key.split(".")[-1]
            rows = self.client.search_read(
                "ir.ui.view",
                [("type", "=", "qweb"), ("name", "=", fallback_name)],
                fields=["id"],
                limit=1,
            )
        if not rows or not rows[0].get("id"):
            raise RuntimeError(f"QWeb inherit target not found: {inherit_key}")
        return int(rows[0]["id"])

    def _deactivate_theme_assets(self, theme_key: str) -> int:
        prefix = f"{self.config.asset_prefix}:{theme_key}:"
        rows = self.client.search_read(
            "ir.asset",
            [("name", "ilike", f"{prefix}%"), ("active", "=", True)],
            fields=["id"],
            limit=500,
        )
        ids = [int(row["id"]) for row in rows if row.get("id")]
        if ids:
            self.client.write("ir.asset", ids, {"active": False})
        return len(ids)

    def _deactivate_theme_views(self, theme_key: str) -> int:
        key_prefix = f"{self.config.view_key_prefix}{theme_key}."
        rows = self.client.search_read(
            "ir.ui.view",
            [("key", "ilike", f"{key_prefix}%"), ("active", "=", True)],
            fields=["id"],
            limit=500,
        )
        ids = [int(row["id"]) for row in rows if row.get("id")]
        if ids:
            self.client.write("ir.ui.view", ids, {"active": False})
        return len(ids)

    def _remove_theme_params(self, theme: Optional[ThemeSpec]) -> int:
        if not theme or not theme.params:
            return 0
        rows = self.client.search_read(
            "ir.config_parameter",
            [("key", "in", list(theme.params.keys()))],
            fields=["id"],
            limit=500,
        )
        ids = [int(row["id"]) for row in rows if row.get("id")]
        if ids:
            self.client.execute("ir.config_parameter", "unlink", ids)
        return len(ids)

    def _upsert_param(self, key: str, value: str) -> None:
        rows = self.client.search_read(
            "ir.config_parameter",
            [("key", "=", key)],
            fields=["id", "value"],
            limit=1,
        )
        if rows:
            row_id = int(rows[0]["id"])
            if str(rows[0].get("value") or "") != value:
                self.client.write("ir.config_parameter", [row_id], {"value": value})
            return
        self.client.create("ir.config_parameter", {"key": key, "value": value})

    def _field_exists(self, model: str, field_name: str) -> bool:
        cache_key = (model, field_name)
        cached = self._field_exists_cache.get(cache_key)
        if cached is not None:
            return cached
        rows = self.client.search("ir.model.fields", [("model", "=", model), ("name", "=", field_name)], limit=1)
        exists = bool(rows)
        self._field_exists_cache[cache_key] = exists
        return exists

    def _resolve_file(self, relative_path: Path) -> Path:
        if relative_path.is_absolute():
            return relative_path
        return self.project_root / relative_path

    def _read_text(self, relative_path: Optional[Path]) -> str:
        if not relative_path:
            return ""
        absolute = self._resolve_file(relative_path)
        if not absolute.exists():
            raise RuntimeError(f"Theme qweb source not found: {absolute}")
        return absolute.read_text(encoding="utf-8")

    def _current_host(self) -> str:
        return (urlparse(self.client.creds.url).hostname or "").strip().lower()

    @staticmethod
    def _slug(value: str) -> str:
        clean = "".join(char.lower() if char.isalnum() else "_" for char in value.strip())
        return "_".join(part for part in clean.split("_") if part) or "theme_view"
