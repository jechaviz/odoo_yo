from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Tuple


@dataclass(frozen=True)
class AppUiConfig:
    variant: str = "classic"

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
    components_css_path: Path = Path("data/app_ui/css/20_shell_layout.css")
    tables_css_path: Path = Path("data/app_ui/css/20_tables.css")
    forms_css_path: Path = Path("data/app_ui/css/30_forms.css")
    config_js_path: Path = Path("data/app_ui/app_ui_config.js")
    i18n_js_path: Path = Path("data/app_ui/app_ui_i18n.js")
    api_js_path: Path = Path("data/app_ui/js/app_ui_api.js")
    state_js_path: Path = Path("data/app_ui/js/app_ui_state.js")
    dom_js_path: Path = Path("data/app_ui/js/invoicing_ui_dom_adapter.js")
    markup_js_path: Path = Path("data/app_ui/js/invoicing_ui_markup.js")
    components_js_path: Path = Path("data/app_ui/js/invoicing_ui_components.js")
    metrics_js_path: Path = Path("data/app_ui/js/invoicing_ui_metrics.js")
    runtime_js_path: Path = Path("data/app_ui/app_ui_vue.js")
    components_dir: Path = Path("data/app_ui/components")
    i18n_yaml_path: Path = Path("data/app_ui/i18n/messages.yml")
    unocss_runtime_js_path: Optional[Path] = None
    css_bundle_paths: Tuple[Path, ...] = (
        Path("data/app_ui/css/00_core.css"),
        Path("data/app_ui/css/10_dashboard.css"),
        Path("data/app_ui/css/20_shell_layout.css"),
        Path("data/app_ui/css/21_sidebar.css"),
        Path("data/app_ui/css/22_topbar_profile.css"),
        Path("data/app_ui/css/23_breadcrumbs.css"),
        Path("data/app_ui/css/24_pane_header.css"),
        Path("data/app_ui/css/25_kpis.css"),
        Path("data/app_ui/css/26_portal_tabs.css"),
        Path("data/app_ui/css/27_datatable_shell.css"),
        Path("data/app_ui/css/28_overlays_popups.css"),
        Path("data/app_ui/css/20_tables.css"),
        Path("data/app_ui/css/30_forms.css"),
    )

    @property
    def css_parts(self) -> Tuple[Path, ...]:
        if self.css_bundle_paths:
            return self.css_bundle_paths
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


def build_app_ui_config(variant: str = "classic") -> AppUiConfig:
    normalized = (variant or "classic").strip().lower()
    if normalized in {"classic", "default"}:
        return AppUiConfig()

    if normalized == "unocss":
        return AppUiConfig(
            variant="unocss",
            view_name="Generic App UI Theme (UnoCSS)",
            version="1.1.0-unocss",
            xml_template_path=Path("data/app_ui_unocss/assets_backend.xml"),
            config_js_path=Path("data/app_ui_unocss/app_ui_config.js"),
            i18n_js_path=Path("data/app_ui_unocss/app_ui_i18n.js"),
            api_js_path=Path("data/app_ui_unocss/js/app_ui_api.js"),
            state_js_path=Path("data/app_ui_unocss/js/app_ui_state.js"),
            dom_js_path=Path("data/app_ui_unocss/js/invoicing_ui_dom_adapter.js"),
            markup_js_path=Path("data/app_ui_unocss/js/invoicing_ui_markup.js"),
            components_js_path=Path("data/app_ui_unocss/js/invoicing_ui_components.js"),
            metrics_js_path=Path("data/app_ui_unocss/js/invoicing_ui_metrics.js"),
            runtime_js_path=Path("data/app_ui_unocss/app_ui_vue.js"),
            components_dir=Path("data/app_ui_unocss/components"),
            i18n_yaml_path=Path("data/app_ui_unocss/i18n/messages.yml"),
            unocss_runtime_js_path=Path("data/app_ui_unocss/js/unocss_runtime.js"),
            css_bundle_paths=(
                Path("data/app_ui_unocss/css/00_core.css"),
                Path("data/app_ui_unocss/css/10_dashboard.css"),
                Path("data/app_ui_unocss/css/20_shell_layout.css"),
                Path("data/app_ui_unocss/css/21_sidebar.css"),
                Path("data/app_ui_unocss/css/22_topbar_profile.css"),
                Path("data/app_ui_unocss/css/23_breadcrumbs.css"),
                Path("data/app_ui_unocss/css/24_pane_header.css"),
                Path("data/app_ui_unocss/css/25_kpis.css"),
                Path("data/app_ui_unocss/css/26_portal_tabs.css"),
                Path("data/app_ui_unocss/css/27_datatable_shell.css"),
                Path("data/app_ui_unocss/css/28_overlays_popups.css"),
                Path("data/app_ui_unocss/css/20_tables.css"),
                Path("data/app_ui_unocss/css/30_forms.css"),
            ),
        )

    raise ValueError(f"Unsupported app UI variant: {variant}")
