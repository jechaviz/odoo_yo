# Audit Report - Theme Framework test1253

## Deployment Result

- Instance: `https://test1253.odoo.com`
- Active theme: `accounting_shell_v1`
- Theme catalog version: `1.1.0`
- Framework delivery mode: `theme_framework` via qweb bootstrap extension + ir.asset registry
- app_ui_bridge status: disabled (no active view/params)

## Component-by-Component Styling Applied

- Tokens/base typography/background: `data/theme_framework/assets/css/00_tokens.css`
- Topbar geometry/icons/chips/hover/focus: `data/theme_framework/assets/css/11_port_topbar.css`
- User menu card/header/items/nested menu: `data/theme_framework/assets/css/12_port_user_menu.css`
- Header group + control panel framing: `data/theme_framework/assets/css/13_port_header_group.css`
- Native surfaces (list/form/kanban/dialog/dropdown/search/notebook/status): `data/theme_framework/assets/css/30_native_components.css`
- Deep navigation/app switcher/discuss/chatter/popovers/notifications: `data/theme_framework/assets/css/31_navigation_deep.css`
- Accounting surface tuning: `data/theme_framework/assets/css/32_accounting_surface.css`
- Runtime DOM port (topbar/user menu FontAwesome + anti-flicker): `data/theme_framework/assets/js/topbar_user_menu_port.js`

## Rollback/Apply Loop Evidence

- Rollback evidence: `01_rollback.json`
- Apply evidence: `02_apply.json`
- Final status evidence: `04_theme_status_final.json`
- app_ui disabled evidence: `05_app_ui_status_final.json`

## Deep Menu + Deep Option Coverage

- Total menus discovered: **260**
- Actionable menus discovered: **192**
- Root apps discovered: **9**
- Visual deep audit routes executed: **192**
- Pass: **192** | Fail: **0**
- Screenshots generated: **192** (`deep_audit/screens/`)

### Coverage by Root App

| Root App | Total | Passed | Failed |
|---|---:|---:|---:|
| Accounting | 77 | 77 | 0 |
| Apps | 4 | 4 | 0 |
| Dashboards | 4 | 4 | 0 |
| Discuss | 10 | 10 | 0 |
| Documents | 6 | 6 | 0 |
| Knowledge | 6 | 6 | 0 |
| Settings | 85 | 85 | 0 |

## Artifacts

- Deep menu map: `deep_audit/deep_menu_map.json`
- Deep menu summary: `deep_audit/deep_menu_summary.md`
- Deep visual audit JSON: `deep_audit/deep_visual_audit.json`
- Deep visual audit markdown: `deep_audit/deep_visual_audit.md`
- Sample probe screenshot: `tmp_probe_after_fix.png`
- User menu open evidence: `deep_audit/topbar_user_menu_open.png`
