# Invoice API Bridge (odoo_yo)

This project provisions a server-action based API bridge in Odoo Online for invoicing from external pages, including complements and addendas.

## Scope implemented

- Invoice creation/posting from `sale.order`
- Payment complement flow (PPD + payment register)
- Foreign trade complement flow
- Carta Porte bridge (`stock.picking`) when model/fields exist
- Generic complement bridge (applies any complement field available in your instance)
- Addenda bridge (append/replace/clear)

## Latest complement versions pinned in baseline

- `Complemento para Recepción de Pagos`: **2.0**
- `Complemento de Comercio Exterior`: **2.0**
- `Complemento Carta Porte`: **3.1**

Baseline metadata is saved in `ir.config_parameter`:

- `yo_invoice_api.complements_baseline_json`

The bridge also discovers **all** `l10n_mx_edi*` fields available in your instance and stores the inventory in:

- `yo_invoice_api.complements_discovery_json`

That discovery is what makes the API cover all complements present in your installed modules.

## Addendas

The bridge supports:

- `yo_addenda_ids`
- `yo_addenda_names`
- `yo_addenda_mode = append|replace|clear`

Known addendas are synchronized and stored in:

- `yo_invoice_api.addendas_known_json`

Local catalog path:

- `data/addendas/known_addendas.json`

You can extend that file with any customer-specific addenda XML architecture and rerun setup.

## Security

All actions enforce API token from:

- `yo_invoice_api.token`

Caller must send context:

- `yo_api_token`

## Provisioned server actions

- `YO API - Invoice Workflow Bridge` (`sale.order`)
- `YO API - Payment Complement Bridge` (`account.move`)
- `YO API - Foreign Trade Complement Bridge` (`account.move`)
- `YO API - Addenda Bridge` (`account.move`)
- `YO API - Generic Complement Bridge` (`account.move`)
- `YO API - Carta Porte Complement Bridge` (`stock.picking`, if available)

## Run with uv

Set env vars:

- `ODOO_URL`
- `ODOO_DB`
- `ODOO_USER`
- `ODOO_PASS`

Then run:

```bash
uv run odoo-yo-bridge
```

## SAT references (official)

- Pagos 2.0: https://www.sat.gob.mx/consulta/12034/comprobante-de-recepcion-de-pagos
- Comercio Exterior 2.0: https://www.sat.gob.mx/minisitio/ComercioExterior/ComercioExterior_v20.pdf
- Carta Porte 3.1: https://www.sat.gob.mx/consultas/68823/complemento-carta-porte-
