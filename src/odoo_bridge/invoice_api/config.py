from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List


@dataclass(frozen=True)
class InvoiceApiConfig:
    token_param: str = "invoice_api.token"
    complements_baseline_param: str = "invoice_api.complements_baseline_json"
    complements_discovery_param: str = "invoice_api.complements_discovery_json"
    addendas_known_param: str = "invoice_api.addendas_known_json"

    legacy_token_param: str = "yo_invoice_api.token"
    legacy_complements_baseline_param: str = "yo_invoice_api.complements_baseline_json"
    legacy_complements_discovery_param: str = "yo_invoice_api.complements_discovery_json"
    legacy_addendas_known_param: str = "yo_invoice_api.addendas_known_json"

    action_invoice: str = "API - Invoice Workflow Bridge"
    action_payment: str = "API - Payment Complement Bridge"
    action_foreign_trade: str = "API - Foreign Trade Complement Bridge"
    action_addenda: str = "API - Addenda Bridge"
    action_generic: str = "API - Generic Complement Bridge"
    action_carta_porte: str = "API - Carta Porte Complement Bridge"

    optional_complement_modules: List[str] = (
        "l10n_mx_edi_extended",
        "l10n_mx_edi_stock",
        "l10n_mx_edi_40",
        "l10n_mx_edi_payment",
    )

    baseline_complements: Dict[str, Dict[str, str]] = None  # type: ignore[assignment]

    def __post_init__(self) -> None:
        if self.baseline_complements is None:
            object.__setattr__(
                self,
                "baseline_complements",
                {
                    "pago": {
                        "display_name": "Complemento para Recepcion de Pagos",
                        "version": "2.0",
                        "scope": "account.move/account.payment",
                        "note": "Applies to PPD flows and payment registration.",
                    },
                    "comercio_exterior": {
                        "display_name": "Complemento de Comercio Exterior",
                        "version": "2.0",
                        "scope": "account.move",
                        "note": "Requires foreign-trade fields and tariff fractions.",
                    },
                    "carta_porte": {
                        "display_name": "Complemento Carta Porte",
                        "version": "3.1",
                        "scope": "stock.picking",
                        "note": "Requires stock transport fields/module availability.",
                    },
                },
            )

    @property
    def action_names(self) -> List[str]:
        return [
            self.action_invoice,
            self.action_payment,
            self.action_foreign_trade,
            self.action_addenda,
            self.action_generic,
            self.action_carta_porte,
        ]

    @property
    def parameter_keys(self) -> List[str]:
        return [
            self.token_param,
            self.complements_baseline_param,
            self.complements_discovery_param,
            self.addendas_known_param,
            self.legacy_token_param,
            self.legacy_complements_baseline_param,
            self.legacy_complements_discovery_param,
            self.legacy_addendas_known_param,
        ]
