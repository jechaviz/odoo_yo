from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional

from odoo_bridge.app_ui.asset_builder import AppUiAssetBuilder
from odoo_bridge.app_ui.config import AppUiConfig, build_app_ui_config
from odoo_bridge.odoo_client import OdooClient


class AppUiThemeManager:
    def __init__(self, client: OdooClient, project_root: Path, config: Optional[AppUiConfig] = None):
        self.client = client
        self.project_root = project_root
        self.config = config or build_app_ui_config("classic")
        self.assets = AppUiAssetBuilder(project_root=project_root, config=self.config)

    def apply(self) -> Dict[str, Any]:
        webclient_bootstrap_id = self._webclient_bootstrap_view_id()
        view_id = self._upsert_assets_view(
            base_view_id=webclient_bootstrap_id,
            arch_db=self.assets.build_arch_db(),
        )
        self._upsert_param(self.config.enabled_param, "1")
        self._upsert_param(self.config.version_param, self.config.version)
        return {
            "status": "ready",
            "view_id": view_id,
            "view_key": self.config.view_key,
            "version": self.config.version,
            "webclient_bootstrap_id": webclient_bootstrap_id,
        }

    def status(self) -> Dict[str, Any]:
        view = self._current_view()
        params = self.client.search_read(
            "ir.config_parameter",
            [("key", "in", list(self.config.parameter_keys))],
            fields=["id", "key", "value"],
            limit=20,
        )
        return {"status": "ok", "view": view, "params": params}

    def rollback(self) -> Dict[str, Any]:
        view = self._current_view()
        deactivated = False
        if view and view.get("id"):
            self.client.write("ir.ui.view", [int(view["id"])], {"active": False})
            deactivated = True

        param_rows = self.client.search_read(
            "ir.config_parameter",
            [("key", "in", list(self.config.parameter_keys))],
            fields=["id", "key"],
            limit=20,
        )
        param_ids = [int(row["id"]) for row in param_rows if row.get("id")]
        if param_ids:
            self.client.execute("ir.config_parameter", "unlink", param_ids)

        return {
            "status": "rolled_back",
            "view_deactivated": deactivated,
            "deleted_params": len(param_ids),
        }

    def _webclient_bootstrap_view_id(self) -> int:
        rows = self.client.search_read(
            "ir.ui.view",
            [("key", "=", "web.webclient_bootstrap"), ("type", "=", "qweb")],
            fields=["id"],
            limit=1,
        )
        if not rows or not rows[0].get("id"):
            raise RuntimeError("web.webclient_bootstrap view not found")
        return int(rows[0]["id"])

    def _current_view(self) -> Optional[Dict[str, Any]]:
        rows = self.client.search_read(
            "ir.ui.view",
            [("key", "in", list(self.config.candidate_view_keys))],
            fields=["id", "name", "key", "active", "inherit_id", "priority"],
            limit=2,
        )
        if not rows:
            return None
        for row in rows:
            if row.get("key") == self.config.view_key:
                return row
        return rows[0]

    def _upsert_assets_view(self, base_view_id: int, arch_db: str) -> int:
        current = self._current_view()
        values = {
            "name": self.config.view_name,
            "type": "qweb",
            "key": self.config.view_key,
            "mode": "extension",
            "inherit_id": base_view_id,
            "priority": 95,
            "active": True,
            "arch_db": arch_db,
        }
        if current and current.get("id"):
            view_id = int(current["id"])
            self.client.write("ir.ui.view", [view_id], values)
            return view_id
        return self.client.create("ir.ui.view", values)

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
