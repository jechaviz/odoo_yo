# Odoo App Revamp (Vue 3 + CDN + UnoCSS)

This feature applies a reversible backend UI layer focused on unified app navigation and high-density operational workspaces.

Current supported runtime:
- UnoCSS-based variant only
- Vue 3 runtime + SFC loader over CDN
- Native Odoo actions preserved under a richer navigation shell

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
- Contract policy: hard-cut only. No compatibility shim or dual runtime namespace after approval.

## Interaction model

- Progressive disclosure by status chips (`All/Paid/Overdue/Pending/Draft`)
- Inline editing in the enriched data table
- Advanced filter configuration and column visibility control
- Skeleton loading during KPI refresh
- Empty-state guidance when no records are available
- Keyboard shortcuts:
  - `/` focus Odoo search
  - `Ctrl + Shift + I` create a new record
  - `Alt + 1..5` quick status scope

## Server footprint

- `ir.ui.view` extension of `web.webclient_bootstrap`
- `ir.config_parameter` based enable/version flags

## SoC layout

- `data/app_ui_unocss/assets_backend.xml` (QWeb asset wrapper)
- `data/app_ui_unocss/app_ui.css` (preview bundle)
- `data/app_ui_unocss/app_ui_vue.js` (runtime wiring + navigation + KPI fetch)
- `data/app_ui_unocss/components/app/{layout|workspace|datatable|primitives}/*.vue` (SFC component layer)
