from __future__ import annotations

import json
import logging
import secrets
from pathlib import Path
from typing import Any, Dict, List, Optional

from odoo_yo_bridge.odoo_client import OdooClient

logger = logging.getLogger(__name__)


class InvoiceApiBridgeManager:
    """Provision server actions for invoice API, complements, and addendas."""

    TOKEN_PARAM = "yo_invoice_api.token"
    COMPLEMENTS_BASELINE_PARAM = "yo_invoice_api.complements_baseline_json"
    COMPLEMENTS_DISCOVERY_PARAM = "yo_invoice_api.complements_discovery_json"
    ADDENDAS_KNOWN_PARAM = "yo_invoice_api.addendas_known_json"

    ACTION_INVOICE = "YO API - Invoice Workflow Bridge"
    ACTION_PAYMENT = "YO API - Payment Complement Bridge"
    ACTION_FOREIGN_TRADE = "YO API - Foreign Trade Complement Bridge"
    ACTION_ADDENDA = "YO API - Addenda Bridge"
    ACTION_GENERIC = "YO API - Generic Complement Bridge"
    ACTION_CARTA_PORTE = "YO API - Carta Porte Complement Bridge"

    BASELINE_COMPLEMENTS: Dict[str, Dict[str, str]] = {
        "pago": {
            "display_name": "Complemento para Recepcion de Pagos",
            "version": "2.0",
            "scope": "account.move/account.payment",
            "note": "Applies to PPD flows and payment registration.",
        },
        "comercio_exterior": {
            "display_name": "Complemento de Comercio Exterior",
            "version": "2.0",
            "scope": "account.move",
            "note": "Requires foreign-trade fields and tariff fractions.",
        },
        "carta_porte": {
            "display_name": "Complemento Carta Porte",
            "version": "3.1",
            "scope": "stock.picking",
            "note": "Requires stock transport fields/module availability.",
        },
    }

    OPTIONAL_COMPLEMENT_MODULES: List[str] = [
        "l10n_mx_edi_extended",
        "l10n_mx_edi_stock",
        "l10n_mx_edi_40",
        "l10n_mx_edi_payment",
    ]

    def __init__(self, client: OdooClient, project_root: Path):
        self.client = client
        self.project_root = project_root

    def run(self) -> Dict[str, Any]:
        result: Dict[str, Any] = {
            "status": "ready",
            "token": {"key": self.TOKEN_PARAM, "created": False},
            "modules": {},
            "actions": {},
            "baseline": self.BASELINE_COMPLEMENTS,
            "discovery": {},
            "addendas": {},
            "errors": [],
            "warnings": [],
        }

        try:
            token, created = self._ensure_token()
            result["token"]["created"] = created
            logger.info("Token ready (%s)", "created" if created else "existing")

            self._upsert_param(self.COMPLEMENTS_BASELINE_PARAM, json.dumps(self.BASELINE_COMPLEMENTS, ensure_ascii=True))

            result["modules"]["l10n_mx_edi"] = self._ensure_module("l10n_mx_edi", required=True)
            for mod in self.OPTIONAL_COMPLEMENT_MODULES:
                state = self._ensure_module(mod, required=False)
                if state != "missing":
                    result["modules"][mod] = state

            discovery = self._discover_complements()
            result["discovery"] = discovery
            self._upsert_param(self.COMPLEMENTS_DISCOVERY_PARAM, json.dumps(discovery, ensure_ascii=True))

            addenda_sync = self._sync_known_addendas()
            result["addendas"] = addenda_sync
            self._upsert_param(self.ADDENDAS_KNOWN_PARAM, json.dumps(addenda_sync, ensure_ascii=True))

            sale_order_model = self._model_id("sale.order")
            move_model = self._model_id("account.move")
            picking_model = self._model_id("stock.picking")
            if not sale_order_model or not move_model:
                raise RuntimeError("Required models not found: sale.order/account.move")

            result["actions"]["invoice_bridge"] = self._upsert_action(
                sale_order_model,
                self.ACTION_INVOICE,
                self._code_invoice_bridge(),
            )
            result["actions"]["payment_complement_bridge"] = self._upsert_action(
                move_model,
                self.ACTION_PAYMENT,
                self._code_payment_bridge(),
            )
            result["actions"]["foreign_trade_bridge"] = self._upsert_action(
                move_model,
                self.ACTION_FOREIGN_TRADE,
                self._code_foreign_trade_bridge(),
            )
            result["actions"]["addenda_bridge"] = self._upsert_action(
                move_model,
                self.ACTION_ADDENDA,
                self._code_addenda_bridge(),
            )
            result["actions"]["generic_complement_bridge"] = self._upsert_action(
                move_model,
                self.ACTION_GENERIC,
                self._code_generic_complements_bridge(),
            )
            if picking_model:
                result["actions"]["carta_porte_bridge"] = self._upsert_action(
                    picking_model,
                    self.ACTION_CARTA_PORTE,
                    self._code_carta_porte_bridge(),
                )
            else:
                result["warnings"].append("stock.picking model not found; carta porte bridge not created")

        except Exception as exc:
            result["status"] = "error"
            result["errors"].append(str(exc))
        return result

    def _ensure_token(self) -> tuple[str, bool]:
        rows = self.client.search_read("ir.config_parameter", [("key", "=", self.TOKEN_PARAM)], fields=["id", "value"], limit=1)
        if rows:
            token = str(rows[0].get("value") or "").strip()
            if token:
                return token, False
            token = secrets.token_urlsafe(32)
            self.client.write("ir.config_parameter", [int(rows[0]["id"])], {"value": token})
            return token, True
        token = secrets.token_urlsafe(32)
        self.client.create("ir.config_parameter", {"key": self.TOKEN_PARAM, "value": token})
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

        # Baseline known addendas in standard l10n_mx_edi demo data.
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

    @staticmethod
    def _code_common_token_guard() -> str:
        return """
ctx = dict(env.context or {})
cfg = env['ir.config_parameter'].sudo()
expected_token = (cfg.get_param('yo_invoice_api.token') or '').strip()
provided_token = str(ctx.get('yo_api_token') or '').strip()
if expected_token and expected_token != provided_token:
    raise ValueError('YO API token mismatch.')
""".strip()

    @classmethod
    def _code_invoice_bridge(cls) -> str:
        return (
            cls._code_common_token_guard()
            + "\n"
            + """
active_ids = list(ctx.get('active_ids') or [])
active_id = ctx.get('active_id')
if active_id and active_id not in active_ids:
    active_ids = [active_id] + active_ids
orders = records if records else env['sale.order'].browse(active_ids)
if not orders:
    raise ValueError('No sale.order records provided.')

post_invoice = bool(ctx.get('yo_post_invoice', True))
register_payment = bool(ctx.get('yo_register_payment', False))
apply_payment_complement = bool(ctx.get('yo_payment_complement', False))
apply_foreign_trade = bool(ctx.get('yo_foreign_trade', False))
apply_addenda = bool(ctx.get('yo_addenda', False))

complement_payload = ctx.get('yo_complement_values') or {}
strict_payload = bool(ctx.get('yo_complement_payload_strict', True))

for order in orders:
    if order.state in ('draft', 'sent'):
        order.action_confirm()
    invoices = order._create_invoices(final=False)
    for move in invoices:
        vals = {}
        if apply_payment_complement and 'l10n_mx_edi_payment_policy' in move._fields:
            vals['l10n_mx_edi_payment_policy'] = 'PPD'
        if apply_foreign_trade:
            for export_field in ('l10n_mx_edi_cfdi_export', 'l10n_mx_edi_export'):
                if export_field in move._fields:
                    vals[export_field] = '02'
                    break

        unknown_fields = []
        for key, value in (complement_payload or {}).items():
            if key not in move._fields:
                unknown_fields.append(key)
                continue
            field_type = move._fields[key].type
            if field_type == 'many2many' and isinstance(value, (list, tuple)):
                vals[key] = [(6, 0, [int(v) for v in value])]
            else:
                vals[key] = value
        if unknown_fields and strict_payload:
            raise ValueError('Unknown complement fields on account.move: %s' % ', '.join(unknown_fields))

        if vals:
            move.write(vals)

        if apply_addenda and 'l10n_mx_edi_addenda_ids' in move._fields:
            addenda_ids = []
            raw_ids = ctx.get('yo_addenda_ids')
            if isinstance(raw_ids, str):
                addenda_ids = [int(x.strip()) for x in raw_ids.split(',') if x.strip().isdigit()]
            elif isinstance(raw_ids, (list, tuple)):
                addenda_ids = [int(x) for x in raw_ids if str(x).isdigit()]
            if addenda_ids:
                mode = str(ctx.get('yo_addenda_mode') or 'append').strip().lower()
                if mode == 'clear':
                    move.write({'l10n_mx_edi_addenda_ids': [(5, 0, 0)]})
                elif mode == 'replace':
                    move.write({'l10n_mx_edi_addenda_ids': [(6, 0, addenda_ids)]})
                else:
                    move.write({'l10n_mx_edi_addenda_ids': [(4, addenda_id) for addenda_id in addenda_ids]})

        if post_invoice and move.state == 'draft':
            move.action_post()

        if register_payment and move.state == 'posted' and (move.amount_residual or 0.0) > 0.0:
            wizard_ctx = dict(ctx)
            wizard_ctx.update({'active_model': 'account.move', 'active_ids': [move.id], 'active_id': move.id})
            payment_vals = {}
            if ctx.get('yo_payment_journal_id'):
                payment_vals['journal_id'] = int(ctx['yo_payment_journal_id'])
            if ctx.get('yo_payment_method_line_id'):
                payment_vals['payment_method_line_id'] = int(ctx['yo_payment_method_line_id'])
            if ctx.get('yo_payment_amount'):
                payment_vals['amount'] = float(ctx['yo_payment_amount'])
            if ctx.get('yo_payment_date'):
                payment_vals['payment_date'] = ctx['yo_payment_date']
            wiz = env['account.payment.register'].with_context(wizard_ctx).create(payment_vals)
            payments = wiz._create_payments()
            for payment in payments:
                if payment.state == 'draft':
                    payment.action_post()

for order in orders:
    order.message_post(body='YO API invoice bridge executed.')
action = {'type': 'ir.actions.act_window_close'}
""".strip()
        )

    @classmethod
    def _code_payment_bridge(cls) -> str:
        return (
            cls._code_common_token_guard()
            + "\n"
            + """
active_ids = list(ctx.get('active_ids') or [])
active_id = ctx.get('active_id')
if active_id and active_id not in active_ids:
    active_ids = [active_id] + active_ids
moves = records if records else env['account.move'].browse(active_ids)
moves = moves.filtered(lambda m: m.move_type in ('out_invoice', 'out_refund'))
if not moves:
    raise ValueError('No invoices provided.')

for move in moves:
    if move.state == 'draft':
        move.action_post()
    if 'l10n_mx_edi_payment_policy' in move._fields:
        move.write({'l10n_mx_edi_payment_policy': 'PPD'})

if bool(ctx.get('yo_register_payment', True)):
    open_moves = moves.filtered(lambda m: m.state == 'posted' and (m.amount_residual or 0.0) > 0.0)
    if open_moves:
        wizard_ctx = dict(ctx)
        wizard_ctx.update({'active_model': 'account.move', 'active_ids': open_moves.ids, 'active_id': open_moves.ids[0]})
        payment_vals = {}
        if ctx.get('yo_payment_journal_id'):
            payment_vals['journal_id'] = int(ctx['yo_payment_journal_id'])
        if ctx.get('yo_payment_method_line_id'):
            payment_vals['payment_method_line_id'] = int(ctx['yo_payment_method_line_id'])
        if ctx.get('yo_payment_amount'):
            payment_vals['amount'] = float(ctx['yo_payment_amount'])
        if ctx.get('yo_payment_date'):
            payment_vals['payment_date'] = ctx['yo_payment_date']
        wiz = env['account.payment.register'].with_context(wizard_ctx).create(payment_vals)
        payments = wiz._create_payments()
        for payment in payments:
            if payment.state == 'draft':
                payment.action_post()

for move in moves:
    move.message_post(body='YO API payment complement bridge executed.')
action = {'type': 'ir.actions.act_window_close'}
""".strip()
        )

    @classmethod
    def _code_foreign_trade_bridge(cls) -> str:
        return (
            cls._code_common_token_guard()
            + "\n"
            + """
active_ids = list(ctx.get('active_ids') or [])
active_id = ctx.get('active_id')
if active_id and active_id not in active_ids:
    active_ids = [active_id] + active_ids
moves = records if records else env['account.move'].browse(active_ids)
moves = moves.filtered(lambda m: m.move_type in ('out_invoice', 'out_refund'))
if not moves:
    raise ValueError('No invoices provided.')

strict_mode = bool(ctx.get('yo_foreign_trade_strict', True))
errors = []
for move in moves:
    export_field = False
    for candidate in ('l10n_mx_edi_cfdi_export', 'l10n_mx_edi_export'):
        if candidate in move._fields:
            export_field = candidate
            break
    if not export_field:
        errors.append('Invoice %s: export field missing' % (move.name or move.id))
        continue
    move.write({export_field: '02'})

    partner = move.partner_id.commercial_partner_id or move.partner_id
    if partner and partner.country_id and partner.country_id.code == 'MX':
        errors.append('Invoice %s: customer country MX is not foreign-trade target.' % (move.name or move.id))

if errors and strict_mode:
    raise ValueError('\\n'.join(errors))

for move in moves:
    move.message_post(body='YO API foreign trade bridge executed.')
action = {'type': 'ir.actions.act_window_close'}
""".strip()
        )

    @classmethod
    def _code_addenda_bridge(cls) -> str:
        return (
            cls._code_common_token_guard()
            + "\n"
            + """
active_ids = list(ctx.get('active_ids') or [])
active_id = ctx.get('active_id')
if active_id and active_id not in active_ids:
    active_ids = [active_id] + active_ids
moves = records if records else env['account.move'].browse(active_ids)
moves = moves.filtered(lambda m: m.move_type in ('out_invoice', 'out_refund'))
if not moves:
    raise ValueError('No invoices provided.')
if 'l10n_mx_edi_addenda_ids' not in env['account.move']._fields:
    raise ValueError('Addenda field l10n_mx_edi_addenda_ids is not available.')

raw_ids = ctx.get('yo_addenda_ids')
addenda_ids = []
if isinstance(raw_ids, str):
    addenda_ids = [int(x.strip()) for x in raw_ids.split(',') if x.strip().isdigit()]
elif isinstance(raw_ids, (list, tuple)):
    addenda_ids = [int(x) for x in raw_ids if str(x).isdigit()]

raw_names = ctx.get('yo_addenda_names')
addenda_names = []
if isinstance(raw_names, str):
    addenda_names = [x.strip() for x in raw_names.split(',') if x.strip()]
elif isinstance(raw_names, (list, tuple)):
    addenda_names = [str(x).strip() for x in raw_names if str(x).strip()]

if addenda_names:
    recs = env['l10n_mx_edi.addenda'].search([('name', 'in', addenda_names)])
    for rec in recs:
        addenda_ids.append(rec.id)

addenda_ids = list(set(addenda_ids))
mode = str(ctx.get('yo_addenda_mode') or 'append').strip().lower()

for move in moves:
    if mode == 'clear':
        move.write({'l10n_mx_edi_addenda_ids': [(5, 0, 0)]})
    elif mode == 'replace':
        move.write({'l10n_mx_edi_addenda_ids': [(6, 0, addenda_ids)]})
    else:
        if addenda_ids:
            move.write({'l10n_mx_edi_addenda_ids': [(4, addenda_id) for addenda_id in addenda_ids]})
    move.message_post(body='YO API addenda bridge executed.')

action = {'type': 'ir.actions.act_window_close'}
""".strip()
        )

    @classmethod
    def _code_generic_complements_bridge(cls) -> str:
        return (
            cls._code_common_token_guard()
            + "\n"
            + """
active_ids = list(ctx.get('active_ids') or [])
active_id = ctx.get('active_id')
if active_id and active_id not in active_ids:
    active_ids = [active_id] + active_ids
moves = records if records else env['account.move'].browse(active_ids)
moves = moves.filtered(lambda m: m.move_type in ('out_invoice', 'out_refund'))
if not moves:
    raise ValueError('No invoices provided.')

payload = ctx.get('yo_complement_values') or {}
strict_mode = bool(ctx.get('yo_complement_payload_strict', True))
if not isinstance(payload, dict):
    raise ValueError('yo_complement_values must be a dict (field->value).')

for move in moves:
    vals = {}
    unknown = []
    for field_name, field_value in payload.items():
        if field_name not in move._fields:
            unknown.append(field_name)
            continue
        field_type = move._fields[field_name].type
        if field_type == 'many2many' and isinstance(field_value, (list, tuple)):
            vals[field_name] = [(6, 0, [int(v) for v in field_value])]
        else:
            vals[field_name] = field_value

    if unknown and strict_mode:
        raise ValueError('Unknown account.move fields: %s' % ', '.join(unknown))
    if vals:
        move.write(vals)
    move.message_post(body='YO API generic complement bridge executed.')

action = {'type': 'ir.actions.act_window_close'}
""".strip()
        )

    @classmethod
    def _code_carta_porte_bridge(cls) -> str:
        return (
            cls._code_common_token_guard()
            + "\n"
            + """
active_ids = list(ctx.get('active_ids') or [])
active_id = ctx.get('active_id')
if active_id and active_id not in active_ids:
    active_ids = [active_id] + active_ids
pickings = records if records else env['stock.picking'].browse(active_ids)
if not pickings:
    raise ValueError('No stock.picking records provided.')

payload = ctx.get('yo_carta_porte_values') or {}
strict_mode = bool(ctx.get('yo_carta_porte_strict', True))
if not isinstance(payload, dict):
    raise ValueError('yo_carta_porte_values must be a dict (field->value).')

for picking in pickings:
    vals = {}
    unknown = []
    for field_name, field_value in payload.items():
        if field_name not in picking._fields:
            unknown.append(field_name)
            continue
        field_type = picking._fields[field_name].type
        if field_type == 'many2many' and isinstance(field_value, (list, tuple)):
            vals[field_name] = [(6, 0, [int(v) for v in field_value])]
        else:
            vals[field_name] = field_value

    if unknown and strict_mode:
        raise ValueError('Unknown stock.picking fields: %s' % ', '.join(unknown))
    if vals:
        picking.write(vals)
    picking.message_post(body='YO API carta porte bridge executed.')

action = {'type': 'ir.actions.act_window_close'}
""".strip()
        )
