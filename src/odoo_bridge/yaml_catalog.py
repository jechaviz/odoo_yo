from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

import yaml


class YamlCatalogLoader:
    """Load YAML catalogs with a strict dict root for predictable injection."""

    def __init__(self, path: Path):
        self.path = path

    def load(self) -> Dict[str, Any]:
        if not self.path.exists():
            raise RuntimeError(f"Required YAML catalog not found: {self.path}")

        data = yaml.safe_load(self.path.read_text(encoding="utf-8"))
        if data is None:
            return {}
        if not isinstance(data, dict):
            raise RuntimeError(f"YAML catalog root must be a mapping: {self.path}")
        return data
