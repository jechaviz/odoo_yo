from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

from odoo_bridge.app_ui.config import AppUiConfig
from odoo_bridge.yaml_catalog import YamlCatalogLoader


class AppUiAssetBuilder:
    def __init__(self, project_root: Path, config: AppUiConfig):
        self.project_root = project_root
        self.config = config

    def build_arch_db(self) -> str:
        xml_template = self._read_asset(self.config.xml_template_path)
        css_bundle = self._build_css_bundle()
        config_js_template = self._read_asset(self.config.config_js_path)
        i18n_js = self._read_asset(self.config.i18n_js_path)
        api_js = self._read_asset(self.config.api_js_path)
        state_js = self._read_asset(self.config.state_js_path)
        dom_js = self._read_asset(self.config.dom_js_path)
        markup_js = self._read_asset(self.config.markup_js_path)
        components_js = self._read_asset(self.config.components_js_path)
        metrics_js = self._read_asset(self.config.metrics_js_path)
        js_template = self._read_asset(self.config.runtime_js_path)

        components_map = self._collect_components_map()
        i18n_catalog = self._read_i18n_catalog()

        config_js = config_js_template.replace(
            "__APP_UI_I18N__", json.dumps(i18n_catalog, ensure_ascii=False)
        )
        js_runtime = js_template.replace(
            "__APP_UI_COMPONENTS_MAP__", json.dumps(components_map, ensure_ascii=False)
        )

        return (
            xml_template
            .replace("__APP_UI_CONFIG_JS__", self._for_cdata(config_js))
            .replace("__APP_UI_I18N_JS__", self._for_cdata(i18n_js))
            .replace("__APP_UI_API_JS__", self._for_cdata(api_js))
            .replace("__APP_UI_STATE_JS__", self._for_cdata(state_js))
            .replace("__APP_UI_DOM_JS__", self._for_cdata(dom_js))
            .replace("__APP_UI_MARKUP_JS__", self._for_cdata(markup_js))
            .replace("__APP_UI_COMPONENTS_JS__", self._for_cdata(components_js))
            .replace("__APP_UI_METRICS_JS__", self._for_cdata(metrics_js))
            .replace("__APP_UI_CSS__", self._for_cdata(css_bundle))
            .replace("__APP_UI_JS__", self._for_cdata(js_runtime))
        )

    def _collect_components_map(self) -> Dict[str, str]:
        components_map: Dict[str, str] = {}
        components_dir = self.project_root / self.config.components_dir
        if not components_dir.exists():
            return components_map
        for file in components_dir.glob("*.vue"):
            components_map[file.name] = file.read_text(encoding="utf-8").strip()
        return components_map

    def _build_css_bundle(self) -> str:
        return "\n\n".join(self._read_asset(path) for path in self.config.css_parts)

    def _read_asset(self, relative_path: Path) -> str:
        path = self.project_root / relative_path
        if not path.exists():
            raise RuntimeError(f"Required asset not found: {path}")
        return path.read_text(encoding="utf-8").strip()

    def _read_i18n_catalog(self) -> Dict[str, Any]:
        loader = YamlCatalogLoader(self.project_root / self.config.i18n_yaml_path)
        return loader.load()

    @staticmethod
    def _for_cdata(content: str) -> str:
        return content.replace("]]>", "]]]]><![CDATA[>")
