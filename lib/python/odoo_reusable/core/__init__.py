"""Reusable core layer for Odoo automation projects."""

from lib.python.odoo_reusable.core.base import BaseRepository, BaseService, Registry, SingletonMeta
from lib.python.odoo_reusable.core.asset_resolution import (
    AssetFallbackStrategy,
    AssetInclusionPolicy,
    AssetMatchStrategy,
    AssetPrefixMatchPolicy,
    AssetResolutionEngine,
    AssetResolutionPolicy,
    AssetResolutionPort,
    AssetResolutionState,
    BaseAssetMatchStrategy,
    GeneratedProductFallbackStrategy,
    PrefixAssetInclusionPolicy,
)
from lib.python.odoo_reusable.core.asset_labels import (
    build_asset_display_label,
    extract_asset_number,
    is_asset_key_match,
    normalize_asset_key,
)
from lib.python.odoo_reusable.core.asset_metadata import (
    coalesce_normalized_metadata_values,
    normalize_legacy_metadata_value,
    parse_serial_metadata_note,
    resolve_serial_metadata_overrides,
)
from lib.python.odoo_reusable.core.tabular_rows import (
    build_normalized_tabular_index,
    clean_tabular_text_value,
    get_tabular_value,
    get_tabular_value_by_aliases,
    normalize_tabular_key,
    set_if_not_empty,
)
from lib.python.odoo_reusable.core.config import Configuration, ConfigurationError
from lib.python.odoo_reusable.core.connection import OdooConnection, OdooConnectionError
from lib.python.odoo_reusable.core.decorators import log_operation, retry, validate_input
from lib.python.odoo_reusable.core.exceptions import (
    AuthenticationError,
    DataLoadError,
    NotFoundError,
    OperationError,
    RateLimitError,
    RPRentalError,
    ValidationError,
)
from lib.python.odoo_reusable.core.phase_runtime import (
    FailurePolicy,
    PhaseSpec,
    build_phase_runner_kwargs,
    build_phase_status_payload,
    serialize_phase_error_payload,
    should_run_phase,
)

__all__ = [
    "AuthenticationError",
    "AssetFallbackStrategy",
    "AssetInclusionPolicy",
    "AssetMatchStrategy",
    "build_asset_display_label",
    "build_normalized_tabular_index",
    "clean_tabular_text_value",
    "coalesce_normalized_metadata_values",
    "extract_asset_number",
    "get_tabular_value",
    "get_tabular_value_by_aliases",
    "is_asset_key_match",
    "AssetPrefixMatchPolicy",
    "AssetResolutionEngine",
    "AssetResolutionPolicy",
    "AssetResolutionPort",
    "AssetResolutionState",
    "BaseAssetMatchStrategy",
    "BaseRepository",
    "BaseService",
    "Configuration",
    "ConfigurationError",
    "DataLoadError",
    "GeneratedProductFallbackStrategy",
    "log_operation",
    "NotFoundError",
    "OdooConnection",
    "OdooConnectionError",
    "OperationError",
    "normalize_legacy_metadata_value",
    "normalize_asset_key",
    "normalize_tabular_key",
    "parse_serial_metadata_note",
    "PrefixAssetInclusionPolicy",
    "FailurePolicy",
    "PhaseSpec",
    "RateLimitError",
    "Registry",
    "retry",
    "RPRentalError",
    "resolve_serial_metadata_overrides",
    "set_if_not_empty",
    "build_phase_runner_kwargs",
    "build_phase_status_payload",
    "serialize_phase_error_payload",
    "should_run_phase",
    "SingletonMeta",
    "ValidationError",
    "validate_input",
]
