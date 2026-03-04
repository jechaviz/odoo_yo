# Backend Theme Framework (odoo_yo)

This framework is the new baseline to build backend themes in `odoo_yo`, combining:

- `app-odoo` pattern: controlled backend asset layering, navbar/user-menu extension points.
- `CybroAddons` pattern: modular backend theme packaging (`xml + scss/css + js`) with menu/systray composition.
- Existing `app_ui_unocss` pattern: runtime contracts, staged rollout, and reversible deployment.

## Goals

1. One generic theming engine for multiple instances.
2. Domain profiles per host:
- `procure1.odoo.com` -> procurement UI profile.
- `test1253.odoo.com` -> accounting/e-invoice UI profile.
3. Safe rollout/rollback without direct module deployment in Odoo Online.

## Location

- Framework code: `src/odoo_bridge/theme_framework/`
- CLI: `src/odoo_bridge/theme_framework_cli.py`
- Catalogs: `data/theme_framework/catalogs/`
- Theme assets: `data/theme_framework/assets/`

## Runtime Model

The framework deploys to Odoo Online through:

1. `ir.attachment` for binary asset payloads.
2. `ir.asset` for bundle inclusion into `web.assets_backend`.
3. `ir.ui.view` for optional QWeb overrides.
4. `ir.config_parameter` for active theme profile metadata.

This makes publication reversible and environment-aware.

## Catalog Contract (YAML)

Catalog root:

- `version`
- `metadata`
- `themes` (list)

Theme keys:

- `key` (required)
- `title`
- `description`
- `inherits` (optional parent theme keys)
- `hosts` (optional allow-list)
- `assets` (path/bundle/directive/sequence)
- `qweb_views` (optional `arch_path` or `arch_inline`, plus `inherit_key`)
- `params` (optional config parameters)

Default catalog:

- `data/theme_framework/catalogs/base.yml`

## CLI Usage

Use env vars:

- `ODOO_URL`
- `ODOO_DB`
- `ODOO_USER`
- `ODOO_PASS`

Commands:

```bash
uv run odoo-theme --status --allow-any-host
uv run odoo-theme --themes procurement_shell_v1 --allow-any-host
uv run odoo-theme --themes accounting_shell_v1 --allow-any-host
uv run odoo-theme --rollback --themes procurement_shell_v1 --allow-any-host
```

## Validation Artifacts

- Canonical final audit:
- `docs/validations/theme_framework/test1253/20260303_233645/`
- Audit summary:
- `docs/validations/theme_framework/test1253/20260303_233645/audit.md`

## Design Discipline

1. Keep assets granular and composable.
2. Keep QWeb patches minimal and purpose-driven.
3. Prefer scoped CSS classes (`theme-fw-*`) and avoid global destructive selectors.
4. Use host-gated profiles until UX parity is validated.
5. Expand by adding new YAML catalogs, not hardcoded logic.

## Next Iteration Plan

1. Add explicit topbar/user-menu QWeb patches in `qweb_views` for pixel parity.
2. Add staged port profiles (`native -> topbar -> user_menu -> sidebar -> shell`).
3. Add visual parity probe output to `docs/validations/theme_framework/`.
4. Add procurement reverse-auction surface package (`oktio`) as a separate theme module.
5. Add accounting CFDI surface package as a separate theme module.
6. Add screenshot-based visual parity audit (reference vs live) in the same validation folder per run.
