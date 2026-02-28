# Invoicing UI Revamp (Vue 3 + CDN + SFC)

This feature applies a reversible backend UI layer focused on unified invoicing navigation:

- Collapsible left icon rail (Font Awesome)
- Compact app switcher (`View All Apps`)
- Unified invoicing workspace with KPI cards
- Keeps native Odoo actions and workflows
- Implemented with Vue 3 runtime + SFC loader over CDN

## Commands

Apply:

```bash
uv run odoo-yo-invoicing-ui
```

Status:

```bash
uv run odoo-yo-invoicing-ui --status
```

Rollback:

```bash
uv run odoo-yo-invoicing-ui --rollback
```

## Runtime safety

- Host guard default: `jesus-chavez-galaviz.odoo.com`
- Browser local kill switch: `Shift + Alt + U`

## Interaction model

- Progressive disclosure by status chips (`All/Paid/Overdue/Pending/Draft`)
- Skeleton loading during KPI refresh
- Empty-state guidance when no invoices are available
- Contextual inline tip under filters
- Keyboard shortcuts:
  - `/` focus Odoo search
  - `Ctrl + Shift + I` create new invoice
  - `Alt + 1..5` quick status scope

## Server footprint

- `ir.ui.view` extension of `web.webclient_bootstrap`:
  - key: `yo_app_ui.webclient_bootstrap_extension`
- `ir.config_parameter`:
  - `yo_app_ui.enabled`
  - `yo_app_ui.version`

## SoC layout

- `data/app_ui/assets_backend.xml` (QWeb asset wrapper)
- `data/app_ui/app_ui.css` (global UI skin)
- `data/app_ui/app_ui_vue.js` (runtime wiring + navigation + KPI fetch)
- `data/app_ui/components/InvoicingShell.vue` (SFC component)
