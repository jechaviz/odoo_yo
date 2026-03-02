from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Tuple


@dataclass(frozen=True)
class ThemeConfig:
    # Single supported runtime variant.
    variant: str = "unocss"

    view_key: str = "app_ui_bridge.webclient_bootstrap_extension"
    view_name: str = "Generic App UI Theme (UnoCSS)"
    version: str = "1.4.0"

    enabled_param: str = "app_ui_bridge.enabled"
    version_param: str = "app_ui_bridge.version"

    xml_template_path: Path = Path("data/app_ui_unocss/assets_backend.xml")
    core_css_path: Path = Path("data/app_ui_unocss/css/00_core.css")
    dashboard_css_path: Path = Path("data/app_ui_unocss/css/10_dashboard.css")
    components_css_path: Path = Path("data/app_ui_unocss/css/20_shell_layout.css")
    tables_css_path: Path = Path("data/app_ui_unocss/css/20_tables.css")
    forms_css_path: Path = Path("data/app_ui_unocss/css/30_forms.css")

    config_js_path: Path = Path("data/app_ui_unocss/app_ui_config.js")
    i18n_js_path: Path = Path("data/app_ui_unocss/app_ui_i18n.js")
    api_js_path: Path = Path("data/app_ui_unocss/js/app_ui_api.js")
    state_js_path: Path = Path("data/app_ui_unocss/js/app_ui_state.js")
    dom_js_path: Path = Path("data/app_ui_unocss/js/invoicing_ui_dom_adapter.js")
    markup_js_path: Path = Path("data/app_ui_unocss/js/invoicing_ui_markup.js")
    components_js_path: Path = Path("data/app_ui_unocss/js/invoicing_ui_components.js")
    metrics_js_path: Path = Path("data/app_ui_unocss/js/invoicing_ui_metrics.js")
    runtime_js_path: Path = Path("data/app_ui_unocss/app_ui_vue.js")
    components_dir: Path = Path("data/app_ui_unocss/components")
    i18n_yaml_path: Path = Path("data/app_ui_unocss/i18n/messages.yml")
    unocss_runtime_js_path: Optional[Path] = Path("data/app_ui_unocss/js/unocss_runtime.js")

    css_bundle_paths: Tuple[Path, ...] = (
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
        Path("data/app_ui_unocss/css/31_shell_cards.css"),
        Path("data/app_ui_unocss/css/32_shell_menus.css"),
        Path("data/app_ui_unocss/css/33_shell_primitives.css"),
        Path("data/app_ui_unocss/css/34_command_palette.css"),
        Path("data/app_ui_unocss/css/35_shell_enrichment.css"),
        Path("data/app_ui_unocss/css/36_shell_insights.css"),
        Path("data/app_ui_unocss/css/37_shell_activity.css"),
        Path("data/app_ui_unocss/css/38_shell_dashboard.css"),
        Path("data/app_ui_unocss/css/39_shell_detail.css"),
        Path("data/app_ui_unocss/css/40_shell_execution.css"),
        Path("data/app_ui_unocss/css/41_shell_operations.css"),
        Path("data/app_ui_unocss/css/20_tables.css"),
        Path("data/app_ui_unocss/css/30_forms.css"),
    )

    demo_js_bundle_paths: Tuple[Path, ...] = (
        Path("data/app_ui_unocss/js/app_ui_shell_demo.js"),
        Path("data/app_ui_unocss/js/app_ui_demo_data.js"),
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
    def demo_js_parts(self) -> Tuple[Path, ...]:
        if self.demo_js_bundle_paths:
            return self.demo_js_bundle_paths
        return (Path("data/app_ui_unocss/js/app_ui_demo_data.js"),)

    @property
    def parameter_keys(self) -> Tuple[str, ...]:
        return (self.enabled_param, self.version_param)

    @property
    def candidate_view_keys(self) -> Tuple[str, ...]:
        return (self.view_key,)


def build_theme_config(variant: str = "unocss") -> ThemeConfig:
    normalized = (variant or "unocss").strip().lower()
    if normalized != "unocss":
        raise ValueError(f"Unsupported app UI variant: {variant}")
    return ThemeConfig()
