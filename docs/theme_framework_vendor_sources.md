# Theme Vendor Sources for `app_ui_unocss` / `theme_framework`

## Source Pool
Imported from: `C:/git/odoo/themes`

Detected backend modules:
- `clarity_backend_theme_bits`
- `code_backend_theme`
- `code_backend_theme_enterprise`
- `hue_backend_theme`
- `steriotites_backend_theme`
- `vista_backend_theme`

Artifacts imported to:
- `data/theme_framework/vendor/imported/`

## Why this helps our theme
These packs include proven backend overrides for:
- `web.NavBar`, `web.UserMenu`, `web.WebClient` (OWL templates)
- Sidebar panel patterns (`#sidebar_panel`, `.sidebar_menu`)
- Native Odoo selectors at scale (`.o_main_navbar`, `.o_control_panel`, `.o_list_renderer`, `.o_form_view`, `.o_kanban_record`, `.o_search_panel`, etc.)
- JS patches for navbar/sidebar interactions via OWL patch API

## Integration Strategy Applied
We did not copy third-party modules directly into Odoo Online runtime.
Instead, we extracted and normalized patterns into our own layered assets:

- `data/theme_framework/assets/css/33_vendor_hybrid_surface.css`
- `data/theme_framework/assets/css/34_vendor_sidebar_panel.css`
- `data/theme_framework/assets/js/vendor_ui_bridge.js`

These assets are loaded through our own catalog profile (`core_port_v1`) and remain host-gated.

## Reproducible Import Command
```bash
uv run python scripts/theme_framework/import_vendor_themes.py \
  --themes-root C:/git/odoo/themes \
  --output-root data/theme_framework/vendor/imported
```

## Imported Summary
See:
- `data/theme_framework/vendor/imported/_summary.json`
- `data/theme_framework/vendor/imported/_summary.md`

This includes module-level counts, copied backend assets, top colors, and top selectors.

## Practical Outcome
`app_ui_unocss` visual target now has external-theme-informed coverage for additional native surfaces beyond topbar/user menu:
- settings pages,
- search panel facets,
- statusbar states,
- calendar/pivot/graph/cohort surfaces,
- optional injected sidebar panels.
