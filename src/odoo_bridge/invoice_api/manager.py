from __future__ import annotations

import json
import logging
import secrets
from pathlib import Path
from typing import Any, Dict, List, Optional

from odoo_bridge.invoice_api.config import InvoiceApiConfig
from odoo_bridge.invoice_api.server_actions import (
    code_addenda_bridge,
    code_carta_porte_bridge,
    code_foreign_trade_bridge,
    code_generic_complements_bridge,
    code_invoice_bridge,
    code_payment_bridge,
)
from odoo_bridge.odoo_client import OdooClient

logger = logging.getLogger(__name__)


class InvoiceApiBridgeManager:
    """Provision server actions for invoice API, complements, and addendas."""

    def __init__(self, client: OdooClient, project_root: Path, config: Optional[InvoiceApiConfig] = None):
        self.client = client
        self.project_root = project_root
        self.config = config or InvoiceApiConfig()

    def run(self) -> Dict[str, Any]:
        result: Dict[str, Any] = {
            "status": "ready",
            "token": {"key": self.config.token_param, "created": False},
            "modules": {},
            "actions": {},
            "baseline": self.config.baseline_complements,
            "discovery": {},
            "addendas": {},
            "errors": [],
            "warnings": [],
        }

        try:
            token, created = self._ensure_token()
            result["token"]["created"] = created
            logger.info("Token ready (%s)", "created" if created else "existing")

            self._upsert_param(self.config.complements_baseline_param, json.dumps(self.config.baseline_complements, ensure_ascii=True))

            result["modules"]["l10n_mx_edi"] = self._ensure_module("l10n_mx_edi", required=True)
            for mod in self.config.optional_complement_modules:
                state = self._ensure_module(mod, required=False)
                if state != "missing":
                    result["modules"][mod] = state

            discovery = self._discover_complements()
            result["discovery"] = discovery
            self._upsert_param(self.config.complements_discovery_param, json.dumps(discovery, ensure_ascii=True))

            addenda_sync = self._sync_known_addendas()
            result["addendas"] = addenda_sync
            self._upsert_param(self.config.addendas_known_param, json.dumps(addenda_sync, ensure_ascii=True))

            sale_order_model = self._model_id("sale.order")
            move_model = self._model_id("account.move")
            picking_model = self._model_id("stock.picking")
            if not sale_order_model or not move_model:
                raise RuntimeError("Required models not found: sale.order/account.move")

            result["actions"]["invoice_bridge"] = self._upsert_action(
                sale_order_model,
                self.config.action_invoice,
                code_invoice_bridge(),
            )
            result["actions"]["payment_complement_bridge"] = self._upsert_action(
                move_model,
                self.config.action_payment,
                code_payment_bridge(),
            )
            result["actions"]["foreign_trade_bridge"] = self._upsert_action(
                move_model,
                self.config.action_foreign_trade,
                code_foreign_trade_bridge(),
            )
            result["actions"]["addenda_bridge"] = self._upsert_action(
                move_model,
                self.config.action_addenda,
                code_addenda_bridge(),
            )
            result["actions"]["generic_complement_bridge"] = self._upsert_action(
                move_model,
                self.config.action_generic,
                code_generic_complements_bridge(),
            )
            if picking_model:
                result["actions"]["carta_porte_bridge"] = self._upsert_action(
                    picking_model,
                    self.config.action_carta_porte,
                    code_carta_porte_bridge(),
                )
            else:
                result["warnings"].append("stock.picking model not found; carta porte bridge not created")

        except Exception as exc:
            result["status"] = "error"
            result["errors"].append(str(exc))
        return result

    def status(self) -> Dict[str, Any]:
        actions = self.client.search_read(
            "ir.actions.server",
            [("name", "in", self.config.action_names)],
            fields=["id", "name", "state", "model_id", "binding_model_id"],
            limit=200,
        )
        params = self.client.search_read(
            "ir.config_parameter",
            [("key", "in", self.config.parameter_keys)],
            fields=["id", "key", "value"],
            limit=200,
        )
        return {
            "status": "ok",
            "action_count": len(actions),
            "param_count": len(params),
            "actions": actions,
            "params": params,
        }

    def rollback(self) -> Dict[str, Any]:
        actions = self.client.search_read(
            "ir.actions.server",
            [("name", "in", self.config.action_names)],
            fields=["id", "name"],
            limit=200,
        )
        action_ids = [int(row["id"]) for row in actions if row.get("id")]
        if action_ids:
            self.client.execute("ir.actions.server", "unlink", action_ids)

        params = self.client.search_read(
            "ir.config_parameter",
            [("key", "in", self.config.parameter_keys)],
            fields=["id", "key"],
            limit=200,
        )
        param_ids = [int(row["id"]) for row in params if row.get("id")]
        if param_ids:
            self.client.execute("ir.config_parameter", "unlink", param_ids)

        post = self.status()
        return {
            "status": "rolled_back",
            "deleted": {
                "actions": len(action_ids),
                "params": len(param_ids),
            },
            "remaining": {
                "actions": post.get("action_count", 0),
                "params": post.get("param_count", 0),
            },
        }

    def _ensure_token(self) -> tuple[str, bool]:
        rows = self.client.search_read(
            "ir.config_parameter",
            [("key", "in", [self.config.token_param, self.config.legacy_token_param])],
            fields=["id", "key", "value"],
            limit=2,
        )

        row_by_key = {str(r.get("key") or ""): r for r in rows}
        new_row = row_by_key.get(self.config.token_param)
        legacy_row = row_by_key.get(self.config.legacy_token_param)

        if new_row:
            token = str(new_row.get("value") or "").strip()
            if token:
                return token, False

        if legacy_row:
            legacy_token = str(legacy_row.get("value") or "").strip()
            if legacy_token:
                self._upsert_param(self.config.token_param, legacy_token)
                return legacy_token, True

        token = secrets.token_urlsafe(32)
        self._upsert_param(self.config.token_param, token)
        return token, True

    def _upsert_param(self, key: str, value: str) -> None:
        rows = self.client.search_read("ir.config_parameter", [("key", "=", key)], fields=["id", "value"], limit=1)
        if rows:
            row_id = int(rows[0]["id"])
            if str(rows[0].get("value") or "") != value:
                self.client.write("ir.config_parameter", [row_id], {"value": value})
            return
        self.client.create("ir.config_parameter", {"key": key, "value": value})

    def _ensure_module(self, name: str, required: bool) -> str:
        rows = self.client.search_read("ir.module.module", [("name", "=", name)], fields=["id", "state"], limit=1)
        if not rows:
            if required:
                raise RuntimeError(f"Required module missing: {name}")
            return "missing"
        module_id = int(rows[0]["id"])
        state = str(rows[0].get("state") or "")
        if state == "installed":
            return "installed"
        if state in {"to install", "to upgrade"}:
            return state
        self.client.execute("ir.module.module", "button_immediate_install", [module_id])
        return "installed"

    def _discover_complements(self) -> Dict[str, Any]:
        fields = self.client.search_read(
            "ir.model.fields",
            [("name", "ilike", "l10n_mx_edi%")],
            fields=["model", "name", "ttype", "relation", "modules"],
            limit=5000,
        )
        by_model: Dict[str, List[Dict[str, Any]]] = {}
        for row in fields:
            model = str(row.get("model") or "")
            by_model.setdefault(model, []).append(
                {
                    "name": row.get("name"),
                    "type": row.get("ttype"),
                    "relation": row.get("relation"),
                    "modules": row.get("modules"),
                }
            )
        return {
            "field_count": len(fields),
            "models": by_model,
        }

    def _sync_known_addendas(self) -> Dict[str, Any]:
        catalog_path = self.project_root / "data" / "addendas" / "known_addendas.json"
        catalog = self._load_or_seed_addenda_catalog(catalog_path)

        if not self._model_id("l10n_mx_edi.addenda"):
            return {
                "created": 0,
                "updated": 0,
                "records": [],
                "catalog_count": len(catalog),
                "status": "model_missing",
            }

        existing = self.client.search_read(
            "l10n_mx_edi.addenda",
            [],
            fields=["id", "name", "arch"],
            limit=500,
        )
        by_name = {str(r.get("name") or ""): r for r in existing if r.get("name")}

        created = 0
        updated = 0
        for item in catalog:
            name = str(item.get("name") or "").strip()
            if not name:
                continue
            arch = str(item.get("arch") or "").strip()
            if not arch:
                continue
            current = by_name.get(name)
            if current:
                current_arch = str(current.get("arch") or "")
                if current_arch != arch:
                    self.client.write("l10n_mx_edi.addenda", [int(current["id"])], {"arch": arch})
                    updated += 1
                item["id"] = int(current["id"])
                continue
            new_id = self.client.create("l10n_mx_edi.addenda", {"name": name, "arch": arch})
            created += 1
            item["id"] = int(new_id)

        final_rows = self.client.search_read(
            "l10n_mx_edi.addenda",
            [],
            fields=["id", "name"],
            limit=500,
        )
        return {
            "created": created,
            "updated": updated,
            "records": [{"id": r.get("id"), "name": r.get("name")} for r in final_rows],
            "catalog_count": len(catalog),
        }

    def _load_or_seed_addenda_catalog(self, catalog_path: Path) -> List[Dict[str, Any]]:
        if catalog_path.exists():
            return json.loads(catalog_path.read_text(encoding="utf-8"))

        seed = [
            {
                "name": "Autozone",
                "version": "latest-known",
                "arch": "<?xml version=\"1.0\"?><t t-xml-node=\"addenda\"><ADDENDA10 VERSION=\"1.0\"/></t>",
            },
            {
                "name": "Bosh",
                "version": "latest-known",
                "arch": "<?xml version=\"1.0\"?><t t-xml-node=\"addenda\"><customized/></t>",
            },
        ]
        catalog_path.parent.mkdir(parents=True, exist_ok=True)
        catalog_path.write_text(json.dumps(seed, indent=2, ensure_ascii=False), encoding="utf-8")
        return seed

    def _model_id(self, model_name: str) -> Optional[int]:
        rows = self.client.search_read("ir.model", [("model", "=", model_name)], fields=["id"], limit=1)
        if not rows:
            return None
        model_id = rows[0].get("id")
        return int(model_id) if isinstance(model_id, int) else None

    def _upsert_action(self, model_id: int, name: str, code: str) -> int:
        rows = self.client.search(
            "ir.actions.server",
            [
                ("name", "=", name),
                ("model_id", "=", model_id),
                ("type", "=", "ir.actions.server"),
                ("state", "=", "code"),
            ],
            limit=1,
        )
        vals = {
            "name": name,
            "type": "ir.actions.server",
            "state": "code",
            "model_id": model_id,
            "binding_model_id": model_id,
            "binding_type": "action",
            "usage": "ir_actions_server",
            "code": code,
        }
        if rows:
            action_id = int(rows[0])
            self.client.write("ir.actions.server", [action_id], vals)
            return action_id
        return self.client.create("ir.actions.server", vals)
