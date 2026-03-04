"""Reusable strategy contracts and engine for asset->product resolution."""

from dataclasses import dataclass
from typing import Callable, Generic, Optional, Protocol, TypeVar, runtime_checkable

TAsset = TypeVar("TAsset")


@dataclass
class AssetResolutionState:
    """Mutable lookup state reused while resolving asset product mappings."""

    product_id_map: dict[str, int]
    resolved_product_by_raw_key: dict[str, int]
    available_codes: set[str]
    available_code_norm_map: dict[str, str]
    description_map: dict[str, str]


@dataclass(frozen=True)
class AssetResolutionPolicy:
    """Policy toggles for the generic resolution engine."""

    reuse_cached_raw_key_matches: bool = True
    allow_fallback_strategy: bool = True


@runtime_checkable
class AssetResolutionPort(Protocol):
    """Port abstraction used by resolution strategies to access side effects."""

    def normalize_key(self, value: str) -> str:
        """Normalize a free-text key for resilient matching."""

    def get_product_id(self, code: str) -> Optional[int]:
        """Return product ID for one canonical product code."""

    def store_mapping(
        self,
        state: AssetResolutionState,
        raw_code: str,
        raw_key: str,
        product_id: int,
    ) -> None:
        """Persist one raw asset-code to product-id mapping."""

    def register_resolved_code(
        self,
        state: AssetResolutionState,
        code: str,
        product_id: int,
    ) -> None:
        """Register a new canonical code (typically from fallback creation)."""


@runtime_checkable
class AssetMatchStrategy(Protocol):
    """Strategy contract for resolving a raw asset label to canonical product code."""

    def resolve_product_code(
        self,
        raw_code: str,
        state: AssetResolutionState,
        port: AssetResolutionPort,
    ) -> Optional[str]:
        """Resolve one raw asset code to an existing canonical product code."""


@dataclass(frozen=True)
class AssetPrefixMatchPolicy:
    """Policy for matching canonical code variants sharing the same prefix."""

    separator: str = "-"
    preferred_suffixes: tuple[str, ...] = ()


class BaseAssetMatchStrategy:
    """Reusable baseline match strategy (exact, normalized, description, prefix variants)."""

    def __init__(
        self,
        prefix_policy: AssetPrefixMatchPolicy = AssetPrefixMatchPolicy(),
    ):
        self._prefix_policy = prefix_policy

    def resolve_product_code(
        self,
        raw_code: str,
        state: AssetResolutionState,
        port: AssetResolutionPort,
    ) -> Optional[str]:
        """Resolve one raw asset label using reusable baseline heuristics."""
        code = str(raw_code or "").strip()
        if not code:
            return None

        direct = self.resolve_direct_mappings(code=code, state=state, port=port)
        if direct:
            return direct

        return self.resolve_prefix_variants(
            code=code,
            available_codes=state.available_codes,
        )

    @staticmethod
    def resolve_direct_mappings(
        code: str,
        state: AssetResolutionState,
        port: AssetResolutionPort,
    ) -> Optional[str]:
        """Resolve code through exact, normalized, and description indexes."""
        if code in state.available_codes:
            return code

        normalized = port.normalize_key(code)
        if normalized and normalized in state.available_code_norm_map:
            return state.available_code_norm_map[normalized]
        if normalized and normalized in state.description_map:
            return state.description_map[normalized]
        return None

    def resolve_prefix_variants(
        self,
        code: str,
        available_codes: set[str],
    ) -> Optional[str]:
        """Resolve code by matching same-prefix variants with suffix preferences."""
        prefix, separator, _suffix = code.rpartition(self._prefix_policy.separator)
        if not separator or not prefix:
            return None

        prefix_with_separator = f"{prefix}{self._prefix_policy.separator}"
        candidates = sorted(
            candidate for candidate in available_codes if candidate.startswith(prefix_with_separator)
        )
        if not candidates:
            return None

        for suffix in self._prefix_policy.preferred_suffixes:
            preferred = next((candidate for candidate in candidates if candidate.endswith(suffix)), None)
            if preferred:
                return preferred
        return candidates[0]


@runtime_checkable
class AssetFallbackStrategy(Protocol):
    """Strategy contract for fallback product behavior when no direct match exists."""

    def ensure_mapping(
        self,
        raw_code: str,
        raw_key: str,
        state: AssetResolutionState,
        port: AssetResolutionPort,
    ) -> Optional[str]:
        """Create/reuse fallback mapping and return the canonical code when successful."""


class GeneratedProductFallbackStrategy:
    """Reusable fallback strategy for creating/reusing products from raw asset labels."""

    def __init__(
        self,
        build_code: Callable[[str], str],
        ensure_product: Callable[[str, str], Optional[int]],
        build_name: Optional[Callable[[str, str], str]] = None,
        on_registered: Optional[Callable[[str, str], None]] = None,
    ):
        self._build_code = build_code
        self._ensure_product = ensure_product
        self._build_name = build_name or self._default_name_builder
        self._on_registered = on_registered

    @staticmethod
    def _default_name_builder(raw_code: str, _fallback_code: str) -> str:
        """Build a readable default fallback product name."""
        return f"Accessory - {str(raw_code or '').title()}"

    def ensure_mapping(
        self,
        raw_code: str,
        raw_key: str,
        state: AssetResolutionState,
        port: AssetResolutionPort,
    ) -> Optional[str]:
        """Create/reuse fallback product and persist state mapping."""
        fallback_code = self._build_code(raw_code)
        fallback_name = self._build_name(raw_code, fallback_code)
        product_id = self._ensure_product(fallback_code, fallback_name)
        if not product_id:
            return None

        port.register_resolved_code(
            state=state,
            code=fallback_code,
            product_id=product_id,
        )
        port.store_mapping(
            state=state,
            raw_code=raw_code,
            raw_key=raw_key,
            product_id=product_id,
        )
        if self._on_registered:
            self._on_registered(fallback_code, raw_code)
        return fallback_code


class AssetResolutionEngine:
    """Generic engine that orchestrates match + fallback strategies."""

    def __init__(
        self,
        match_strategy: AssetMatchStrategy,
        fallback_strategy: Optional[AssetFallbackStrategy] = None,
        policy: AssetResolutionPolicy = AssetResolutionPolicy(),
    ):
        self._match_strategy = match_strategy
        self._fallback_strategy = fallback_strategy
        self._policy = policy

    def ensure_mapping(
        self,
        raw_code: str,
        state: AssetResolutionState,
        port: AssetResolutionPort,
    ) -> Optional[str]:
        """Ensure one raw asset code is mapped to product_id in state/product map."""
        code = str(raw_code or "").strip()
        if not code:
            return None

        raw_key = port.normalize_key(code)
        if code in state.product_id_map:
            return code

        if self._policy.reuse_cached_raw_key_matches and raw_key:
            cached_product_id = state.resolved_product_by_raw_key.get(raw_key)
            if cached_product_id:
                state.product_id_map[code] = cached_product_id
                return code

        resolved_code = self._match_strategy.resolve_product_code(
            raw_code=code,
            state=state,
            port=port,
        )
        if resolved_code:
            resolved_product_id = port.get_product_id(resolved_code)
            if resolved_product_id:
                port.store_mapping(
                    state=state,
                    raw_code=code,
                    raw_key=raw_key,
                    product_id=resolved_product_id,
                )
                return resolved_code

        if self._policy.allow_fallback_strategy and self._fallback_strategy:
            return self._fallback_strategy.ensure_mapping(
                raw_code=code,
                raw_key=raw_key,
                state=state,
                port=port,
            )

        return None


@runtime_checkable
class AssetInclusionPolicy(Protocol, Generic[TAsset]):
    """Policy contract for deciding whether one asset row belongs to a batch."""

    def should_include(self, asset: TAsset) -> bool:
        """Return True when one asset row should be included in processing."""


@dataclass(frozen=True)
class PrefixAssetInclusionPolicy:
    """Reusable prefix-based inclusion policy for asset code/name values."""

    code_prefixes: tuple[str, ...] = ()
    name_prefixes: tuple[str, ...] = ()

    def should_include_values(self, code: str, name: str) -> bool:
        """Check inclusion from pre-extracted code/name values."""
        normalized_code = str(code or "").upper().strip()
        normalized_name = str(name or "").upper().strip()
        return normalized_code.startswith(self.code_prefixes) or normalized_name.startswith(
            self.name_prefixes
        )
