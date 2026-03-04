"""Shared infrastructure helpers for view setup."""

import logging
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


class ViewInfrastructureMixin:
    """Low-level Odoo view/action/menu CRUD helpers."""

    def _search_with_inactive(
        self,
        model: str,
        domain: list[tuple[str, str, Any]],
        limit: Optional[int] = None,
    ) -> list[int]:
        """Search records with `active_test=False` so archived records are reused."""
        kwargs: Dict[str, Any] = {"context": {"active_test": False}}
        if limit is not None:
            kwargs["limit"] = limit
        return self.connection.execute(model, "search", domain, **kwargs)

    def _unlink_automation(self, name: str, model_name: str) -> int:
        """Delete automation rules by name/model and return removed count."""
        model_id = self._get_model_id(model_name)
        if not model_id:
            return 0
        ids = self._search_with_inactive(
            "base.automation",
            [("name", "=", name), ("model_id", "=", model_id)],
        )
        if not ids:
            return 0
        self.connection.unlink("base.automation", ids)
        logger.info("Deleted %s automation rule(s): %s", len(ids), name)
        return len(ids)

    def _unlink_action_window(self, name: str, res_model: str) -> int:
        """Delete act_window records by exact name/model and return removed count."""
        ids = self.connection.search(
            "ir.actions.act_window",
            [
                ("name", "=", name),
                ("res_model", "=", res_model),
                ("type", "=", "ir.actions.act_window"),
            ],
        )
        if not ids:
            return 0
        self.connection.unlink("ir.actions.act_window", ids)
        logger.info("Deleted %s action(s): %s (%s)", len(ids), name, res_model)
        return len(ids)

    def _unlink_server_action(self, name: str, model_name: str) -> int:
        """Delete server actions by exact name/model and return removed count."""
        model_id = self._get_model_id(model_name)
        if not model_id:
            return 0
        ids = self.connection.search(
            "ir.actions.server",
            [
                ("name", "=", name),
                ("model_id", "=", model_id),
                ("type", "=", "ir.actions.server"),
            ],
        )
        if not ids:
            return 0
        self.connection.unlink("ir.actions.server", ids)
        logger.info("Deleted %s server action(s): %s", len(ids), name)
        return len(ids)

    def _unlink_menu_by_name(self, name: str, parent_id: int) -> int:
        """Delete menu records by exact name/parent and return removed count."""
        if not parent_id:
            return 0
        ids = self.connection.search(
            "ir.ui.menu",
            [("name", "=", name), ("parent_id", "=", parent_id)],
        )
        if not ids:
            return 0
        self.connection.unlink("ir.ui.menu", ids)
        logger.info("Deleted %s menu(s): %s", len(ids), name)
        return len(ids)

    def _unlink_legacy_quality_check_server_actions(self) -> int:
        """Delete obsolete server actions left by older quality.check setups."""
        model_id = self._get_model_id("quality.check")
        if not model_id:
            return 0

        candidates = self.connection.search_read(
            "ir.actions.server",
            [("model_id", "=", model_id), ("state", "=", "code")],
            fields=["id", "name", "code"],
        )
        ids_to_remove: list[int] = []
        for candidate in candidates:
            action_id = candidate.get("id")
            if not isinstance(action_id, int):
                continue
            name = str(candidate.get("name") or "")
            code = str(candidate.get("code") or "")
            if (
                "x_rp_checkbox" in code
                or "x_rp_qc_seeded" in code
                or "rp_skip_qc_seed" in code
                or "RP Quality Check" in name
                or "Checkbox" in name
            ):
                ids_to_remove.append(action_id)

        if not ids_to_remove:
            return 0

        unique_ids = sorted(set(ids_to_remove))
        self.connection.unlink("ir.actions.server", unique_ids)
        logger.info("Deleted %s legacy quality.check server action(s): %s", len(unique_ids), unique_ids)
        return len(unique_ids)

    def _get_model_id(self, model_name: str) -> Optional[int]:
        """Get ir.model ID by technical model name."""
        records = self.connection.search_read(
            "ir.model",
            [("model", "=", model_name)],
            fields=["id"],
            limit=1,
        )
        if not records:
            return None
        model_id = records[0].get("id")
        return int(model_id) if isinstance(model_id, int) else None

    def _upsert_view(
        self,
        name: str,
        model: str,
        view_type: str,
        arch: str,
        inherit_id: Optional[int] = None,
        mode: str = "primary",
    ) -> int:
        """Create or update a view by unique tuple (name, model, type)."""
        existing = self.connection.search(
            "ir.ui.view",
            [("name", "=", name), ("model", "=", model), ("type", "=", view_type)],
            limit=1,
        )

        values = {
            "name": name,
            "model": model,
            "type": view_type,
            "arch_db": arch,
            "active": True,
            "mode": mode,
        }
        if inherit_id:
            values["inherit_id"] = inherit_id

        if existing:
            view_id = existing[0]
            self.connection.write("ir.ui.view", [view_id], values)
            logger.info("Updated view: %s (%s) ID=%s", name, model, view_id)
            return view_id

        view_id = self.connection.create("ir.ui.view", values)
        logger.info("Created view: %s (%s) ID=%s", name, model, view_id)
        return view_id

    def _upsert_qweb_view(
        self,
        name: str,
        arch: str,
        inherit_id: Optional[int] = None,
        mode: str = "extension",
    ) -> int:
        """Create or update a qweb view by unique tuple (name, type=qweb)."""
        existing = self.connection.search(
            "ir.ui.view",
            [("name", "=", name), ("type", "=", "qweb")],
            limit=1,
        )

        values: Dict[str, Any] = {
            "name": name,
            "type": "qweb",
            "arch_db": arch,
            "active": True,
            "mode": mode,
            "model": False,
        }
        if inherit_id:
            values["inherit_id"] = inherit_id

        if existing:
            view_id = existing[0]
            self.connection.write("ir.ui.view", [view_id], values)
            logger.info("Updated qweb view: %s ID=%s", name, view_id)
            return view_id

        view_id = self.connection.create("ir.ui.view", values)
        logger.info("Created qweb view: %s ID=%s", name, view_id)
        return view_id

    def _upsert_action_window(self, name: str, res_model: str, values: Dict[str, Any]) -> int:
        """Create or update an `ir.actions.act_window` record by (name, res_model)."""
        existing = self.connection.search(
            "ir.actions.act_window",
            [
                ("name", "=", name),
                ("res_model", "=", res_model),
                ("type", "=", "ir.actions.act_window"),
            ],
            limit=1,
        )
        payload = {
            "name": name,
            "type": "ir.actions.act_window",
            "res_model": res_model,
            **values,
        }
        if existing:
            action_id = existing[0]
            self.connection.write("ir.actions.act_window", [action_id], payload)
            logger.info("Updated action: %s (%s) ID=%s", name, res_model, action_id)
            return action_id
        action_id = self.connection.create("ir.actions.act_window", payload)
        logger.info("Created action: %s (%s) ID=%s", name, res_model, action_id)
        return action_id

    def _find_menu_id_by_path(self, path: list[str]) -> Optional[int]:
        """Find menu ID by a hierarchical path, e.g. ['Inventory', 'Products', 'Products'].""" 
        if not path:
            return None
        parent_id: Optional[int] = None
        for name in path:
            domain: list[tuple[str, str, Any]] = [("name", "=", name)]
            if parent_id is None:
                domain.append(("parent_id", "=", False))
            else:
                domain.append(("parent_id", "=", parent_id))
            ids = self.connection.search("ir.ui.menu", domain, limit=1)
            if not ids:
                return None
            parent_id = ids[0]
        return parent_id

    def _set_menu_action(self, menu_id: int, action_id: int) -> int:
        """Set action on menu. Returns 1 when menu exists and write is attempted."""
        if not menu_id or not action_id:
            return 0
        self.connection.write(
            "ir.ui.menu",
            [menu_id],
            {"action": f"ir.actions.act_window,{action_id}"},
        )
        logger.info("Updated menu action: menu=%s action=%s", menu_id, action_id)
        return 1

    def _upsert_menu(self, name: str, parent_id: int, action_id: int, sequence: int) -> int:
        """Create or update a child menu and bind it to an act_window action."""
        if not parent_id or not action_id:
            return 0
        existing = self.connection.search(
            "ir.ui.menu",
            [("name", "=", name), ("parent_id", "=", parent_id)],
            limit=1,
        )
        values = {
            "name": name,
            "parent_id": parent_id,
            "sequence": sequence,
            "action": f"ir.actions.act_window,{action_id}",
        }
        if existing:
            self.connection.write("ir.ui.menu", [existing[0]], values)
            logger.info("Updated menu: %s (ID=%s)", name, existing[0])
            return 1
        menu_id = self.connection.create("ir.ui.menu", values)
        logger.info("Created menu: %s (ID=%s)", name, menu_id)
        return 1

    def _unlink_view(self, name: str, model: str, view_type: str) -> int:
        """Delete existing views by exact name/model/type and return removed count."""
        ids = self.connection.search(
            "ir.ui.view",
            [("name", "=", name), ("model", "=", model), ("type", "=", view_type)],
        )
        if not ids:
            return 0
        self.connection.unlink("ir.ui.view", ids)
        logger.info("Deleted %s view(s): %s (%s) IDs=%s", len(ids), name, model, ids)
        return len(ids)

    def _unlink_views(
        self,
        model: str,
        view_type: str,
        extra_domain: Optional[list[tuple[str, str, Any]]] = None,
    ) -> int:
        """Delete all views by model/type plus extra domain filters."""
        domain: list[tuple[str, str, Any]] = [("model", "=", model), ("type", "=", view_type)]
        if extra_domain:
            domain.extend(extra_domain)
        ids = self.connection.search("ir.ui.view", domain)
        if not ids:
            return 0
        self.connection.unlink("ir.ui.view", ids)
        logger.info("Deleted %s view(s) by domain on %s/%s", len(ids), model, view_type)
        return len(ids)

    def _field_exists(self, model: str, field_name: str) -> bool:
        """Check whether a field exists on a model."""
        ids = self.connection.search(
            "ir.model.fields",
            [("model", "=", model), ("name", "=", field_name)],
            limit=1,
        )
        return bool(ids)

    def _find_view_id(self, model: str, name: str, view_type: str) -> Optional[int]:
        """Find a view ID by model + technical name + type."""
        ids = self.connection.search(
            "ir.ui.view",
            [("model", "=", model), ("name", "=", name), ("type", "=", view_type)],
            limit=1,
        )
        return ids[0] if ids else None

    def _find_qweb_view_id_by_key(self, key: str) -> Optional[int]:
        """Find qweb view ID by external key (e.g., sale.report_saleorder_document)."""
        ids = self.connection.search(
            "ir.ui.view",
            [("type", "=", "qweb"), ("key", "=", key)],
            limit=1,
        )
        if ids:
            return ids[0]
        fallback_name = key.split(".")[-1]
        ids = self.connection.search(
            "ir.ui.view",
            [("type", "=", "qweb"), ("name", "=", fallback_name)],
            limit=1,
        )
        return ids[0] if ids else None

    def _build_field_nodes(
        self,
        model: str,
        field_names: list[str],
        optional: Optional[str] = None,
    ) -> str:
        """Build XML field nodes for existing fields only."""
        parts: list[str] = []
        for field_name in field_names:
            if not self._field_exists(model, field_name):
                continue
            optional_attr = f' optional="{optional}"' if optional else ""
            parts.append(f"<field name=\"{field_name}\"{optional_attr}/>")
        return "\n            ".join(parts)

    def _build_existing_field_node(self, model: str, field_name: str, attrs: str = "") -> str:
        """Build one XML field node only when the model field exists."""
        if not self._field_exists(model, field_name):
            return ""
        suffix = f" {attrs}" if attrs else ""
        return f"<field name=\"{field_name}\"{suffix}/>"

