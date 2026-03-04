from __future__ import annotations

from pathlib import Path
from typing import Iterable

from odoo_bridge.theme_framework.contracts import ThemeCatalogSpec
from odoo_bridge.yaml_catalog import YamlCatalogLoader


class ThemeCatalogLoader:
    """Load and merge one or more theme catalogs."""

    def __init__(self, project_root: Path):
        self.project_root = project_root

    def load_one(self, catalog_path: Path) -> ThemeCatalogSpec:
        absolute = self._resolve(catalog_path)
        payload = YamlCatalogLoader(absolute).load()
        return ThemeCatalogSpec.from_dict(payload)

    def load_many(self, catalog_paths: Iterable[Path]) -> ThemeCatalogSpec:
        merged_themes = {}
        metadata = {}
        version = "1"
        for path in catalog_paths:
            catalog = self.load_one(path)
            version = catalog.version
            merged_themes.update(catalog.themes)
            metadata.update(catalog.metadata)
        return ThemeCatalogSpec(version=version, themes=merged_themes, metadata=metadata)

    def _resolve(self, catalog_path: Path) -> Path:
        if catalog_path.is_absolute():
            return catalog_path
        return self.project_root / catalog_path

