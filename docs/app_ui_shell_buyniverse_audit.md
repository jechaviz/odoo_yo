# App UI Shell Audit vs Buyniverse

Date: 2026-03-01

## Scope

This audit covers the extraction of reusable `Buyniverse` shell primitives into the UnoCSS preview shell under:

- `data/app_ui_unocss/components`
- `data/app_ui_unocss/css`
- `docs/app_ui_preview`

This pass is intentionally limited to the shell outside the datatable. The advanced datatable extraction was already covered in:

- `docs/app_ui_buyniverse_audit.md`

## Goal

Confirm that the preview shell now carries reusable `Buyniverse` behavior beyond the table itself:

1. richer header behavior
2. richer sidebar semantics
3. reusable shell cards
4. collapsible shell panels
5. shell-level context menu
6. demo state and i18n coverage for shell interactions

## Extracted primitives

The following shell primitives were added:

- `components/StatCard.vue`
- `components/DataCard.vue`
- `components/CollapsibleCard.vue`
- `components/ShellContextMenu.vue`
- `components/UserAvatar.vue`
- `components/ProgressBar.vue`
- `components/ButtonGroup.vue`
- `components/Modal.vue`
- `components/QuickCreateModal.vue`

The following existing shell components were upgraded to consume them:

- `components/Header.vue`
- `components/Sidebar.vue`
- `components/Shell.vue`
- `components/KPIs.vue`

The following shell styles were added:

- `css/31_shell_cards.css`
- `css/32_shell_menus.css`
- `css/33_shell_primitives.css`
- `css/34_command_palette.css`
- `css/35_shell_enrichment.css`

The following runtime layers were extended:

- `app_ui_i18n.js`
- `js/app_ui_shell_demo.js`
- `js/app_ui_demo_data.js`
- `js/app_ui_state.js`
- `src/odoo_bridge/app_ui/config.py`
- `src/odoo_bridge/app_ui/asset_builder.py`
- `docs/app_ui_preview/index.html`

## Validation target

Preview URL:

- `docs/app_ui_preview/index.html?locale=en`

Audit runner:

- `codex_shell_audit.js`
- Self-hosted static server started inside the audit process to avoid external preview dependencies

Evidence:

- `docs/app_ui_preview/shell_pass_2.png`
- `docs/app_ui_preview/shell_audit_interactions.png`

## Pass matrix

| Capability | Buyniverse reference | Preview target | Result | Notes |
| --- | --- | --- | --- | --- |
| Header utility strip | `components/layout/Header.tsx` | `components/Header.vue` | PASS | Added app switcher trigger, notification menu, profile menu, shared utility actions |
| Notification surface | `components/layout/Header.tsx` | `components/Header.vue` | PASS | Unread badge + mark-all action present |
| Profile dropdown | `components/layout/Header.tsx` | `components/Header.vue` | PASS | Menu structure enriched and detached from static hover-only behavior |
| Profile switcher | `components/layout/Header.tsx` | `components/Header.vue` + `components/UserAvatar.vue` | PASS | Switching user updates the shell profile state |
| Sidebar semantic groups | `components/layout/Sidebar.tsx` | `components/Sidebar.vue` | PASS | Brand metadata, badges, settings popup labels, preserved collapsed semantics |
| Reusable stat card | `components/ui/StatCard.tsx` | `components/StatCard.vue` | PASS | Integrated through `KPIs.vue` |
| Reusable data card | `components/ui/DataCard.tsx` | `components/DataCard.vue` | PASS | Used in workspace panels and mega panel |
| Reusable collapsible surface | `components/ui/CollapsibleCard.tsx` | `components/CollapsibleCard.vue` | PASS | Used for workspace shell panels |
| Shell context menu | `components/layout/AppContextMenu.tsx` | `components/ShellContextMenu.vue` | PASS | Available on KPI cards and workspace cards |
| Shell mode switcher | `components/layout/Header.tsx` + shell workspace patterns | `components/Shell.vue` + `components/ButtonGroup.vue` | PASS | Mode selection filters visible workspace cards |
| Quick create surface | `components/ui/DataCard.tsx` + modal patterns | `components/QuickCreateModal.vue` + `components/Modal.vue` | PASS | Two grouped quick-create lanes validated |
| Card progress/assignees | `components/ui/DataCard.tsx` enrichments | `components/DataCard.vue` + `components/ProgressBar.vue` + `components/UserAvatar.vue` | PASS | Workspace cards now expose progress and ownership cues |
| Demo shell data | n/a | `js/app_ui_demo_data.js` | PASS | Notifications, brand, workspace cards added |
| Shell i18n coverage | n/a | `i18n/messages.yml` + `app_ui_i18n.js` | PASS | Header, sidebar, modebar, card, quick-create, and action copy added |
| Odoo asset composition | n/a | `src/odoo_bridge/app_ui/config.py` + `asset_builder.py` | PASS | Shell demo JS and enrichment CSS are now part of the generated runtime bundle |

## Interaction audit

Automated validation executed against the local preview shell with real pointer interaction for the context-menu path.

Validated:

1. shell mounts correctly
2. mega menu opens and closes through the overlay contract
3. quick-create modal opens from the primary CTA
4. quick-create modal exposes two groups with two actions each
5. profile menu opens
6. profile switcher changes the visible shell user
7. shell mode switcher activates `Data quality`
8. `Collections focus` disappears in `Data quality`
9. `Master data watch` remains visible in `Data quality`
10. notification menu opens with rendered items
11. KPI context menu opens
12. KPI context action changes the shell filter state
13. collapsible workspace panel closes and reopens
14. workspace card context menu opens with expected item count

Result payload:

```json
{
  "ok": true,
  "errors": [],
  "notes": [],
  "previewUrl": "http://127.0.0.1:{dynamic-port}/docs/app_ui_preview/index.html?locale=en",
  "megaOpen": true,
  "quickCreateVisible": true,
  "quickCreateGroups": 2,
  "quickCreateCards": 2,
  "quickCreateCardsSecondGroup": 2,
  "profileSwitchGroups": 4,
  "switchedProfileName": "Laura Soto",
  "activeShellMode": "Data quality",
  "collectionsVisibleInQuality": 0,
  "masterDataVisibleInQuality": 1,
  "notificationItems": 3,
  "firstContext": "Focus Pending",
  "portalFilter": "Pending",
  "contextClosed": true,
  "firstPanelClosed": true,
  "firstPanelOpen": true,
  "workspaceContextCount": 2
}
```

## Audit conclusion

Status: PASS

This slice is now at parity for the reusable shell primitives that were missing outside the datatable.

What is now covered:

- shared shell cards
- shared shell panels
- richer header menus
- richer sidebar metadata
- shell-level context actions
- shell demo state + i18n scaffolding

What is still outside this audit:

- porting this shell into live Odoo runtime
- replacing all app-specific page bodies with the new shell
- extracting deeper `Buyniverse` modules beyond the shell primitives
- role-specific shell variants per Odoo app

## Recommended next slice

Apply the same shell primitives to:

1. app landing surfaces
2. form surfaces
3. dashboard/workbench pages
4. Odoo live runtime injection path

## Pass 3 Addendum (2026-03-01)

Scope completed in this pass:

1. hard-cut contract cleanup (no compatibility shim)
2. deeper extraction beyond shell chrome into runtime work surfaces
3. interaction audit updated to validate new workbench behavior

### Hard-cut contract cleanup

Replaced XML asset placeholders with the new canonical namespace:

- `__ODOO_APP_*` -> `__ODOO_SHELL_*`

Updated files:

- `data/app_ui_unocss/assets_backend.xml`
- `src/odoo_bridge/app_ui/asset_builder.py`

Verification:

- `rg "__ODOO_APP_" src data docs` -> no matches
- no legacy runtime namespace references remained (`window.APP_UI*`, `APP_UI_*`)

### New extracted surfaces from Buyniverse patterns

Added primitives:

- `components/app/primitives/LazyOnVisible.vue`
- `components/app/primitives/Spinner.vue`

Integrated into shell:

- `components/app/workspace/DashboardCanvas.vue`
- `components/app/workspace/WorkbenchSection.vue`
- `components/app/workspace/Deck.vue`
- `components/app/datatable/DataTable.vue`

Runtime/i18n updates:

- `data/app_ui_unocss/app_ui_i18n.js`
- `data/app_ui_unocss/i18n/messages.yml`
- `data/app_ui_unocss/css/33_shell_primitives.css`
- `data/app_ui_unocss/css/27_datatable_shell.css`

### Interaction audit (updated)

`codex_shell_audit.js` now validates:

1. command palette opening from topbar search trigger
2. command palette close behavior
3. lazy shell wrappers present
4. dashboard surface available inside the shell deck
5. execution pad write path (save note)
6. execution action side effect in activity feed

Result payload:

```json
{
  "ok": true,
  "errors": [],
  "lazySections": 4,
  "dashboardWidgetCount": 2,
  "commandPaletteOpen": true,
  "commandPaletteItems": 6,
  "commandPaletteClosed": true,
  "executionPadVisible": true,
  "executionActivityLabels": [
    "Execution note",
    "Status change",
    "Quality alert",
    "Task assigned"
  ]
}
```

## Pass 4 Addendum (2026-03-01)

Scope completed in this pass:

1. deterministic audit runtime for shell interactions
2. operations-surface interaction completion (comments/files/tasks/milestones/form)
3. reactive loop hardening across bidirectional `v-model` operation panels

### Audit stability hardening

Updated `codex_shell_audit.js`:

- browser launch fallback chain (`msedge` -> `chrome` -> bundled chromium)
- watchdog moved to early lifecycle to avoid dead runs before launch
- robust operations-tab activation helper (`activateOpsTab`)
- direct DOM-click fallback in operations actions where pointer interception can occur in headless mode

### Operations surface extraction validation

Validated interactions now include:

1. comments tab: append comment (delta +1)
2. files tab: create draft file (delta +1)
3. tasks tab: drag-and-drop task transition
4. milestones tab: render milestones + linked task rows
5. form tab: render editable schema and submit action

Result payload (latest):

```json
{
  "ok": true,
  "errors": [],
  "operationsCommentDelta": 1,
  "operationsFileDelta": 1,
  "operationsTaskMoved": true,
  "operationsMilestoneCount": 3,
  "operationsMilestoneTaskRows": 2,
  "operationsFormRendered": 9
}
```

### Reactive loop fix (critical)

Root cause:

- `OperationsSurface` and operations child panels emitted updates while syncing incoming prop state, creating a feedback loop (`prop -> local -> emit -> parent set -> prop ...`).

Fix applied:

- guard flag `isSyncingFromProp` in:
  - `components/app/workspace/OperationsSurface.vue`
  - `components/app/workspace/operations/CommentsPanel.vue`
  - `components/app/workspace/operations/FilesPanel.vue`
  - `components/app/workspace/operations/TasksPanel.vue`
  - `components/app/workspace/operations/FormPanel.vue`
- payload-equality guard before emitting (`JSON.stringify` compare against current prop state)
- parent-side idempotent update in `components/app/layout/Shell.vue` (`onOperationsUpdate`)

Impact:

- no more lock/freeze when changing operations tabs or posting comments/files
- operations interactions now complete in audit without watchdog timeout
