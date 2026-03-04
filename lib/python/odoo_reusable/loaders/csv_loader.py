"""
CSV Data Loader - Loads data from CSV files
===========================================
Implements data loading from .csv files.
"""

import csv
import logging
from typing import Any, Callable, Dict, List, Optional

from lib.python.odoo_reusable.loaders.base import DataLoader, DataLoaderFactory

logger = logging.getLogger(__name__)


class CSVDataLoader(DataLoader):
    """Data loader for CSV files."""

    def __init__(
        self,
        file_path: str,
        delimiter: str = ",",
        quotechar: str = '"',
        encoding: str = "utf-8",
        has_header: bool = True,
        validator: Optional[Callable] = None,
        transformer: Optional[Callable] = None,
    ):
        super().__init__(file_path, validator, transformer)
        self.delimiter = delimiter
        self.quotechar = quotechar
        self.encoding = encoding
        self.has_header = has_header
        self._headers: List[str] = []

    def _read_file(self) -> List[Dict[str, Any]]:
        rows = []

        try:
            with open(self.file_path, "r", encoding=self.encoding, newline="") as file_obj:
                reader = csv.reader(file_obj, delimiter=self.delimiter, quotechar=self.quotechar)

                if self.has_header:
                    self._headers = [header.strip() for header in next(reader)]
                else:
                    first_row = next(reader)
                    self._headers = [f"col_{idx}" for idx in range(len(first_row))]
                    rows.append(dict(zip(self._headers, first_row)))

                for row in reader:
                    if len(row) == len(self._headers):
                        rows.append(dict(zip(self._headers, row)))
                    else:
                        logger.warning(
                            "Row has %s columns, expected %s",
                            len(row),
                            len(self._headers),
                        )

        except UnicodeDecodeError:
            logger.warning("Failed to decode with %s, trying latin-1", self.encoding)
            with open(self.file_path, "r", encoding="latin-1", newline="") as file_obj:
                reader = csv.reader(file_obj, delimiter=self.delimiter, quotechar=self.quotechar)

                if self.has_header:
                    self._headers = [header.strip() for header in next(reader)]

                for row in reader:
                    if len(row) == len(self._headers):
                        rows.append(dict(zip(self._headers, row)))

        return rows

    def _transform_row(self, row: Dict[str, Any]) -> Dict[str, Any]:
        return row

    def get_headers(self) -> List[str]:
        return self._headers


class ProductCSVLoader(CSVDataLoader):
    """Specialized loader for product data from CSV."""

    def __init__(self, file_path: str):
        super().__init__(file_path, transformer=self._transform_product)

    @staticmethod
    def _transform_product(row: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "default_code": row.get("model_code", "").strip(),
            "name": row.get("description", "").strip(),
            "standard_price": float(row.get("cost", 0) or 0),
            "list_price": float(row.get("list_price", 0) or 0),
            "detailed_type": "product",
            "tracking": "serial",
            "rent_ok": True,
        }


class AssetCSVLoader(CSVDataLoader):
    """Specialized loader for asset data from CSV."""

    def __init__(self, file_path: str):
        super().__init__(file_path, transformer=self._transform_asset)

    @staticmethod
    def _transform_asset(row: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "name": row.get("rpr_asset_number", "").strip(),
            "product_code": row.get("model_code", "").strip(),
            "psn": row.get("psn", "").strip(),
            "esn": row.get("esn", "").strip(),
            "vin": row.get("vin", "").strip(),
            "cost": float(row.get("cost", 0) or 0),
            "list_price": float(row.get("list_price", 0) or 0),
        }


class PricingCSVLoader(CSVDataLoader):
    """Specialized loader for pricing data from CSV."""

    def __init__(self, file_path: str):
        super().__init__(file_path, transformer=self._transform_pricing)

    @staticmethod
    def _transform_pricing(row: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "product_code": row.get("model_code", "").strip(),
            "daily_rate": float(row.get("daily_rate", 0) or 0),
            "weekly_rate": float(row.get("weekly_rate", 0) or 0),
            "monthly_rate": float(row.get("monthly_rate", 0) or 0),
        }


DataLoaderFactory.register("csv", CSVDataLoader)

