# Theme Framework Final Audit - test1253 (test1)

Date: `2026-03-03 23:36:45` (local)

Target:

- Host: `test1253.odoo.com`
- DB: `test1253`
- Theme: `accounting_shell_v1`

## Procedure (strict sequential)

1. `rollback` target theme.
2. `status` after rollback.
3. `apply` target theme.
4. `status` after first apply.
5. `apply` same theme again.
6. `status` after second apply.

Evidence files:

- `01_rollback.json`
- `02_status_after_rollback.json`
- `03_apply_1.json`
- `04_status_after_apply_1.json`
- `05_apply_2.json`
- `06_status_after_apply_2.json`

## Acceptance Criteria and Result

1. Rollback removes active surface:
- Expected: no active themes and no active framework assets.
- Result: PASS (`active_themes: []`, `assets: []`).

2. First apply publishes accounting theme:
- Expected: 5 backend assets active and theme marker persisted.
- Result: PASS (`assets IDs: 1..5`, `active_themes: ["accounting_shell_v1"]`).

3. Second apply is idempotent:
- Expected: no new duplicate active assets.
- Result: PASS (asset IDs remained `1..5`).

## Technical Hardening Included

1. `OdooClient` now retries XML-RPC calls with exponential backoff for `429/503`.
2. Theme upsert now reuses inactive records (`active_test=False`).
3. Duplicate cleanup behavior added:
- keeps one canonical `ir.asset` and one canonical `ir.ui.view`,
- deactivates extra duplicates.

## Final State

- Theme framework is operational on `test1253` with audited deployment and idempotent re-apply behavior.

