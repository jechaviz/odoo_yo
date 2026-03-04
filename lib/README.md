# Generic Library Boundary

`/lib` contains reusable code/assets not tied to one customer workflow.

## Web assets (generic)

- `odoo/web/list_column_drag_reorder.js`
- `odoo/web/list_column_drag_reorder.css`
- `manifest.json` declarative registration for backend bundles.

## Python modules (generic)

- `python/odoo_reusable/core/*`
- `python/odoo_reusable/loaders/base.py`
- `python/odoo_reusable/loaders/csv_loader.py`
- `python/odoo_reusable/loaders/json_loader.py`
- `python/odoo_reusable/odoo_views/infrastructure.py`

These modules provide:

- reusable Odoo connection/config/error primitives
- reusable base service/repository patterns
- reusable decorators and data-loader abstractions

## Implementation-specific (keep in `/src`)

- rental workflow states/transitions
- RPP/RPH naming and domain rules
- catalog/menu and report behavior for this customer
- orchestration decisions (phase ordering, stop/continue policies)

Rule of thumb:

- if it runs unchanged in another Odoo implementation, keep it in `/lib`
- if it encodes this project's rental business logic, keep it in `/src`
