Playbooks for Odoo automation (odoo_yo)

This folder contains a WAIBA playbook to open the Odoo instance, log in and read session info (to extract the technical DB name).

How to run (local WAIBA):

1. Start the WAIBA runtime or launch Edge with remote debugging on port 9222.
2. Run the playbook `get_db_playbook.yaml` with your WAIBA runner/orchestrator.

Output:
- `output/session_info.json` will contain the JSON returned by `/web/session/get_session_info`. Inspect for the `db` field.

If `get_session_info` does not include the DB, ask me and I will add an alternate playbook that creates a temporary Server Action and executes it to reveal the DB.
