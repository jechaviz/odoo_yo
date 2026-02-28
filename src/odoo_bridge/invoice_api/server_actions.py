from __future__ import annotations

TOKEN_PARAM = "invoice_api.token"
LEGACY_TOKEN_PARAM = "yo_invoice_api.token"


def _code_common_token_guard() -> str:
    return f"""
ctx = dict(env.context or {{}})

def _ctx(name, default=None, legacy=None):
    if name in ctx:
        value = ctx.get(name)
        return default if value is None else value
    if legacy and legacy in ctx:
        value = ctx.get(legacy)
        return default if value is None else value
    return default

cfg = env['ir.config_parameter'].sudo()
expected_token = (cfg.get_param('{TOKEN_PARAM}') or cfg.get_param('{LEGACY_TOKEN_PARAM}') or '').strip()
provided_token = str(_ctx('api_token', '', 'yo_api_token') or '').strip()
if expected_token and expected_token != provided_token:
    raise ValueError('API token mismatch.')
""".strip()


def _compose(body: str) -> str:
    return _code_common_token_guard() + "\n" + body.strip()


def code_invoice_bridge() -> str:
    return _compose(
        """
active_ids = list(_ctx('active_ids', []))
active_id = _ctx('active_id')
if active_id and active_id not in active_ids:
    active_ids = [active_id] + active_ids
orders = records if records else env['sale.order'].browse(active_ids)
if not orders:
    raise ValueError('No sale.order records provided.')

post_invoice = bool(_ctx('post_invoice', True, 'yo_post_invoice'))
register_payment = bool(_ctx('register_payment', False, 'yo_register_payment'))
apply_payment_complement = bool(_ctx('payment_complement', False, 'yo_payment_complement'))
apply_foreign_trade = bool(_ctx('foreign_trade', False, 'yo_foreign_trade'))
apply_addenda = bool(_ctx('addenda', False, 'yo_addenda'))

complement_payload = _ctx('complement_values', {{}}, 'yo_complement_values') or {{}}
strict_payload = bool(_ctx('complement_payload_strict', True, 'yo_complement_payload_strict'))

for order in orders:
    if order.state in ('draft', 'sent'):
        order.action_confirm()
    invoices = order._create_invoices(final=False)
    for move in invoices:
        vals = {{}}
        if apply_payment_complement and 'l10n_mx_edi_payment_policy' in move._fields:
            vals['l10n_mx_edi_payment_policy'] = 'PPD'
        if apply_foreign_trade:
            for export_field in ('l10n_mx_edi_cfdi_export', 'l10n_mx_edi_export'):
                if export_field in move._fields:
                    vals[export_field] = '02'
                    break

        unknown_fields = []
        for key, value in (complement_payload or {{}}).items():
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
            raw_ids = _ctx('addenda_ids', None, 'yo_addenda_ids')
            if isinstance(raw_ids, str):
                addenda_ids = [int(x.strip()) for x in raw_ids.split(',') if x.strip().isdigit()]
            elif isinstance(raw_ids, (list, tuple)):
                addenda_ids = [int(x) for x in raw_ids if str(x).isdigit()]
            if addenda_ids:
                mode = str(_ctx('addenda_mode', 'append', 'yo_addenda_mode') or 'append').strip().lower()
                if mode == 'clear':
                    move.write({{'l10n_mx_edi_addenda_ids': [(5, 0, 0)]}})
                elif mode == 'replace':
                    move.write({{'l10n_mx_edi_addenda_ids': [(6, 0, addenda_ids)]}})
                else:
                    move.write({{'l10n_mx_edi_addenda_ids': [(4, addenda_id) for addenda_id in addenda_ids]}})

        if post_invoice and move.state == 'draft':
            move.action_post()

        if register_payment and move.state == 'posted' and (move.amount_residual or 0.0) > 0.0:
            wizard_ctx = dict(ctx)
            wizard_ctx.update({{'active_model': 'account.move', 'active_ids': [move.id], 'active_id': move.id}})
            payment_vals = {{}}
            payment_journal_id = _ctx('payment_journal_id', None, 'yo_payment_journal_id')
            payment_method_line_id = _ctx('payment_method_line_id', None, 'yo_payment_method_line_id')
            payment_amount = _ctx('payment_amount', None, 'yo_payment_amount')
            payment_date = _ctx('payment_date', None, 'yo_payment_date')
            if payment_journal_id:
                payment_vals['journal_id'] = int(payment_journal_id)
            if payment_method_line_id:
                payment_vals['payment_method_line_id'] = int(payment_method_line_id)
            if payment_amount:
                payment_vals['amount'] = float(payment_amount)
            if payment_date:
                payment_vals['payment_date'] = payment_date
            wiz = env['account.payment.register'].with_context(wizard_ctx).create(payment_vals)
            payments = wiz._create_payments()
            for payment in payments:
                if payment.state == 'draft':
                    payment.action_post()

for order in orders:
    order.message_post(body='API invoice bridge executed.')
action = {{'type': 'ir.actions.act_window_close'}}
"""
    )


def code_payment_bridge() -> str:
    return _compose(
        """
active_ids = list(_ctx('active_ids', []))
active_id = _ctx('active_id')
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
        move.write({{'l10n_mx_edi_payment_policy': 'PPD'}})

if bool(_ctx('register_payment', True, 'yo_register_payment')):
    open_moves = moves.filtered(lambda m: m.state == 'posted' and (m.amount_residual or 0.0) > 0.0)
    if open_moves:
        wizard_ctx = dict(ctx)
        wizard_ctx.update({{'active_model': 'account.move', 'active_ids': open_moves.ids, 'active_id': open_moves.ids[0]}})
        payment_vals = {{}}
        payment_journal_id = _ctx('payment_journal_id', None, 'yo_payment_journal_id')
        payment_method_line_id = _ctx('payment_method_line_id', None, 'yo_payment_method_line_id')
        payment_amount = _ctx('payment_amount', None, 'yo_payment_amount')
        payment_date = _ctx('payment_date', None, 'yo_payment_date')
        if payment_journal_id:
            payment_vals['journal_id'] = int(payment_journal_id)
        if payment_method_line_id:
            payment_vals['payment_method_line_id'] = int(payment_method_line_id)
        if payment_amount:
            payment_vals['amount'] = float(payment_amount)
        if payment_date:
            payment_vals['payment_date'] = payment_date
        wiz = env['account.payment.register'].with_context(wizard_ctx).create(payment_vals)
        payments = wiz._create_payments()
        for payment in payments:
            if payment.state == 'draft':
                payment.action_post()

for move in moves:
    move.message_post(body='API payment complement bridge executed.')
action = {{'type': 'ir.actions.act_window_close'}}
"""
    )


def code_foreign_trade_bridge() -> str:
    return _compose(
        """
active_ids = list(_ctx('active_ids', []))
active_id = _ctx('active_id')
if active_id and active_id not in active_ids:
    active_ids = [active_id] + active_ids
moves = records if records else env['account.move'].browse(active_ids)
moves = moves.filtered(lambda m: m.move_type in ('out_invoice', 'out_refund'))
if not moves:
    raise ValueError('No invoices provided.')

strict_mode = bool(_ctx('foreign_trade_strict', True, 'yo_foreign_trade_strict'))
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
    move.write({{export_field: '02'}})

    partner = move.partner_id.commercial_partner_id or move.partner_id
    if partner and partner.country_id and partner.country_id.code == 'MX':
        errors.append('Invoice %s: customer country MX is not foreign-trade target.' % (move.name or move.id))

if errors and strict_mode:
    raise ValueError('\\n'.join(errors))

for move in moves:
    move.message_post(body='API foreign trade bridge executed.')
action = {{'type': 'ir.actions.act_window_close'}}
"""
    )


def code_addenda_bridge() -> str:
    return _compose(
        """
active_ids = list(_ctx('active_ids', []))
active_id = _ctx('active_id')
if active_id and active_id not in active_ids:
    active_ids = [active_id] + active_ids
moves = records if records else env['account.move'].browse(active_ids)
moves = moves.filtered(lambda m: m.move_type in ('out_invoice', 'out_refund'))
if not moves:
    raise ValueError('No invoices provided.')
if 'l10n_mx_edi_addenda_ids' not in env['account.move']._fields:
    raise ValueError('Addenda field l10n_mx_edi_addenda_ids is not available.')

raw_ids = _ctx('addenda_ids', None, 'yo_addenda_ids')
addenda_ids = []
if isinstance(raw_ids, str):
    addenda_ids = [int(x.strip()) for x in raw_ids.split(',') if x.strip().isdigit()]
elif isinstance(raw_ids, (list, tuple)):
    addenda_ids = [int(x) for x in raw_ids if str(x).isdigit()]

raw_names = _ctx('addenda_names', None, 'yo_addenda_names')
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
mode = str(_ctx('addenda_mode', 'append', 'yo_addenda_mode') or 'append').strip().lower()

for move in moves:
    if mode == 'clear':
        move.write({{'l10n_mx_edi_addenda_ids': [(5, 0, 0)]}})
    elif mode == 'replace':
        move.write({{'l10n_mx_edi_addenda_ids': [(6, 0, addenda_ids)]}})
    else:
        if addenda_ids:
            move.write({{'l10n_mx_edi_addenda_ids': [(4, addenda_id) for addenda_id in addenda_ids]}})
    move.message_post(body='API addenda bridge executed.')

action = {{'type': 'ir.actions.act_window_close'}}
"""
    )


def code_generic_complements_bridge() -> str:
    return _compose(
        """
active_ids = list(_ctx('active_ids', []))
active_id = _ctx('active_id')
if active_id and active_id not in active_ids:
    active_ids = [active_id] + active_ids
moves = records if records else env['account.move'].browse(active_ids)
moves = moves.filtered(lambda m: m.move_type in ('out_invoice', 'out_refund'))
if not moves:
    raise ValueError('No invoices provided.')

payload = _ctx('complement_values', {{}}, 'yo_complement_values') or {{}}
strict_mode = bool(_ctx('complement_payload_strict', True, 'yo_complement_payload_strict'))
if not isinstance(payload, dict):
    raise ValueError('complement_values must be a dict (field->value).')

for move in moves:
    vals = {{}}
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
    move.message_post(body='API generic complement bridge executed.')

action = {{'type': 'ir.actions.act_window_close'}}
"""
    )


def code_carta_porte_bridge() -> str:
    return _compose(
        """
active_ids = list(_ctx('active_ids', []))
active_id = _ctx('active_id')
if active_id and active_id not in active_ids:
    active_ids = [active_id] + active_ids
pickings = records if records else env['stock.picking'].browse(active_ids)
if not pickings:
    raise ValueError('No stock.picking records provided.')

payload = _ctx('carta_porte_values', {{}}, 'yo_carta_porte_values') or {{}}
strict_mode = bool(_ctx('carta_porte_strict', True, 'yo_carta_porte_strict'))
if not isinstance(payload, dict):
    raise ValueError('carta_porte_values must be a dict (field->value).')

for picking in pickings:
    vals = {{}}
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
    picking.message_post(body='API carta porte bridge executed.')

action = {{'type': 'ir.actions.act_window_close'}}
"""
    )
