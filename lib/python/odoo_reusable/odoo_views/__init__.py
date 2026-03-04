"""Reusable helpers for Odoo view/action/menu setup flows."""

from lib.python.odoo_reusable.odoo_views.domain_literals import (
    build_domain_literal,
    build_or_domain_literal,
)
from lib.python.odoo_reusable.odoo_views.infrastructure import ViewInfrastructureMixin

__all__ = [
    "build_domain_literal",
    "build_or_domain_literal",
    "ViewInfrastructureMixin",
]
