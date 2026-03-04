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
- Audit scripts: `scripts/theme_framework/`

## Runtime Model

The framework deploys to Odoo Online through:

1. `ir.attachment` for binary asset payloads.
2. `ir.asset` registry records (auditability/idempotency).
3. `ir.ui.view` bootstrap extension (`web.webclient_bootstrap`) to guarantee asset injection in Odoo Online.
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
uv run odoo-theme --rollback --themes accounting_shell_v1 --allow-any-host
```

## Deep Validation Workflow

1. Export full actionable menu map:

```bash
uv run python scripts/theme_framework/deep_menu_map.py --allow-any-host --out-dir docs/validations/theme_framework/test1253/<stamp>/deep_audit
```

2. Run deep visual traversal (all actionable menus + screenshots):

```bash
node scripts/theme_framework/deep_visual_audit.js \
  --menu-map=docs/validations/theme_framework/test1253/<stamp>/deep_audit/deep_menu_map.json \
  --out-dir=docs/validations/theme_framework/test1253/<stamp>/deep_audit \
  --sample-per-root=2
```

3. Review outputs:

- `deep_menu_map.json`
- `deep_menu_summary.md`
- `deep_visual_audit.json`
- `deep_visual_audit.md`
- `deep_audit/screens/*.png`

## Validation Artifacts

- Canonical audited run:
- `docs/validations/theme_framework/test1253/20260303_235224/`
- Audit report:
- `docs/validations/theme_framework/test1253/20260303_235224/audit.md`
- Latest vendor-base audited run:
- `docs/validations/theme_framework/test1253/20260304_003448/`
- Audit report:
- `docs/validations/theme_framework/test1253/20260304_003448/audit.md`

## Design Discipline

1. Keep assets granular and composable.
2. Keep QWeb patches minimal and purpose-driven.
3. Prefer scoped CSS classes and avoid global destructive selectors.
4. Use host-gated profiles until UX parity is validated.
5. Expand by adding YAML profiles, not hardcoded host branches.

## Next Iteration Plan

1. Add procurement-specific port profile (`procure1`) and validate with same deep audit flow.
2. Add component-level parity checklist (topbar, user menu, control panel, list/form/kanban/dialog).
3. Add screenshot diff scoring (baseline vs live) for geometry/color drift control.
4. Add automated rollback-on-failure gate when deep visual pass drops below threshold.

## External Theme Base (apps.odoo.com)

Downloaded backend themes under `C:/git/odoo/themes` are now integrated as an analyzed base.

Import command:

```bash
uv run python scripts/theme_framework/import_vendor_themes.py \
  --themes-root C:/git/odoo/themes \
  --output-root data/theme_framework/vendor/imported
```

Integration outputs:

- `data/theme_framework/vendor/imported/_summary.json`
- `data/theme_framework/vendor/imported/_summary.md`
- `docs/theme_framework_vendor_sources.md`

Catalog integration (active in `core_port_v1`):

- `data/theme_framework/assets/css/33_vendor_hybrid_surface.css`
- `data/theme_framework/assets/css/34_vendor_sidebar_panel.css`
- `data/theme_framework/assets/js/vendor_ui_bridge.js`
