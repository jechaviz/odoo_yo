"""
JSON Data Loader - Loads data from JSON files
=============================================
Implements data loading from .json files.
"""

import json
from typing import Any, Callable, Dict, List, Optional

from lib.python.odoo_reusable.core.exceptions import DataLoadError
from lib.python.odoo_reusable.loaders.base import DataLoader, DataLoaderFactory


class JSONDataLoader(DataLoader):
    """Data loader for JSON files."""

    def __init__(
        self,
        file_path: str,
        data_key: Optional[str] = None,
        validator: Optional[Callable] = None,
        transformer: Optional[Callable] = None,
    ):
        super().__init__(file_path, validator, transformer)
        self.data_key = data_key

    def _read_file(self) -> List[Dict[str, Any]]:
        with open(self.file_path, "r", encoding="utf-8") as file_obj:
            data = json.load(file_obj)

        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            if self.data_key:
                if self.data_key not in data:
                    raise DataLoadError(
                        f"Key not found in JSON: {self.data_key}",
                        file_path=str(self.file_path),
                    )
                return data[self.data_key]
            return [data]

        raise DataLoadError(
            f"Unexpected JSON structure: {type(data)}",
            file_path=str(self.file_path),
        )

    def _transform_row(self, row: Dict[str, Any]) -> Dict[str, Any]:
        return row


class QCInspectionJSONLoader(JSONDataLoader):
    """Specialized loader for QC inspection data from JSON."""

    def __init__(self, file_path: str):
        super().__init__(file_path, data_key="inspections")

    def _transform_row(self, row: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "inspection_type": row.get("inspection_type"),
            "equipment_number": row.get("equipment_number"),
            "pump_serial_number": row.get("pump_serial_number"),
            "engine_serial_number": row.get("engine_serial_number"),
            "model": row.get("model"),
            "hour_meter": row.get("hour_meter"),
            "items": row.get("items", []),
            "overall_notes": row.get("overall_notes", ""),
        }


DataLoaderFactory.register("json", JSONDataLoader)

