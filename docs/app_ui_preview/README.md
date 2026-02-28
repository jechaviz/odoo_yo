# App UI Preview

Run local preview without touching Odoo instance:

```powershell
cd C:\git\customers\yo\odoo_yo
uv run python -m http.server 8787
```

Open:

- `http://127.0.0.1:8787/docs/app_ui_preview/index.html`
- Spanish locale: `http://127.0.0.1:8787/docs/app_ui_preview/index.html?locale=es`

Notes:
- Uses `data/app_ui/components/AppShell.vue` directly.
- Loads i18n catalog from `data/app_ui/i18n/messages.yml`.
- Uses `sQuery` for interactions in preview controls.
