# Migration Note

This package (`odoo_yo_bridge`) is now a backward-compatibility shim.

Core implementation moved to `src/odoo_bridge` with neutral naming, improved separation of concerns, and modular architecture.

Use these commands going forward:

- `uv run python -m odoo_bridge.cli --status`
- `uv run python -m odoo_bridge.cli`
- `uv run python -m odoo_bridge.cli --rollback`
- `uv run python -m odoo_bridge.app_ui_cli --status`
- `uv run python -m odoo_bridge.app_ui_cli`
- `uv run python -m odoo_bridge.app_ui_cli --rollback`

Legacy command/module paths still work via wrappers.
