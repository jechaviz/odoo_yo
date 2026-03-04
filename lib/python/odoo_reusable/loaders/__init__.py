"""Reusable data-loading abstractions."""

from lib.python.odoo_reusable.loaders.base import DataLoadResult, DataLoader, DataLoaderFactory
from lib.python.odoo_reusable.loaders.csv_loader import CSVDataLoader
from lib.python.odoo_reusable.loaders.json_loader import JSONDataLoader

__all__ = [
    "CSVDataLoader",
    "DataLoadResult",
    "DataLoader",
    "DataLoaderFactory",
    "JSONDataLoader",
]
