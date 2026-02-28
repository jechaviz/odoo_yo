from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Tuple


@dataclass(frozen=True)
class AppUiConfig:
    view_key: str = "app_ui_bridge.webclient_bootstrap_extension"
    view_name: str = "Generic App UI Theme"
    version: str = "1.0.1"

    enabled_param: str = "app_ui_bridge.enabled"
    version_param: str = "app_ui_bridge.version"

    legacy_view_key: str = "yo_app_ui.webclient_bootstrap_extension"
    legacy_enabled_param: str = "yo_app_ui.enabled"
    legacy_version_param: str = "yo_app_ui.version"

    xml_template_path: Path = Path("data/app_ui/assets_backend.xml")
    core_css_path: Path = Path("data/app_ui/css/00_core.css")
    dashboard_css_path: Path = Path("data/app_ui/css/10_dashboard.css")
    components_css_path: Path = Path("data/app_ui/css/20_components.css")
    tables_css_path: Path = Path("data/app_ui/css/20_tables.css")
    forms_css_path: Path = Path("data/app_ui/css/30_forms.css")
    config_js_path: Path = Path("data/app_ui/app_ui_config.js")
    i18n_js_path: Path = Path("data/app_ui/app_ui_i18n.js")
    api_js_path: Path = Path("data/app_ui/js/app_ui_api.js")
    state_js_path: Path = Path("data/app_ui/js/app_ui_state.js")
    dom_js_path: Path = Path("data/app_ui/js/app_ui_dom_adapter.js")
    markup_js_path: Path = Path("data/app_ui/js/app_ui_markup.js")
    components_js_path: Path = Path("data/app_ui/js/app_ui_components.js")
    metrics_js_path: Path = Path("data/app_ui/js/app_ui_metrics.js")
    runtime_js_path: Path = Path("data/app_ui/app_ui_vue.js")
    components_dir: Path = Path("data/app_ui/components")
    i18n_yaml_path: Path = Path("data/app_ui/i18n/messages.yml")

    @property
    def css_parts(self) -> Tuple[Path, ...]:
        return (
            self.core_css_path,
            self.dashboard_css_path,
            self.components_css_path,
            self.tables_css_path,
            self.forms_css_path,
        )

    @property
    def parameter_keys(self) -> Tuple[str, ...]:
        return (
            self.enabled_param,
            self.version_param,
            self.legacy_enabled_param,
            self.legacy_version_param,
        )

    @property
    def candidate_view_keys(self) -> Tuple[str, ...]:
        return (self.view_key, self.legacy_view_key)
