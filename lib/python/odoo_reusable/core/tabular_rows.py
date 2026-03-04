"""Reusable helpers for tolerant tabular row/header extraction."""

import math
from typing import Any, Mapping, MutableMapping, Sequence

DEFAULT_TABULAR_EMPTY_TOKENS = frozenset({"none", "nan"})


def normalize_tabular_key(key: Any) -> str:
    """Normalize a header key so minor punctuation/spacing changes do not break lookup."""
    return "".join(ch.lower() for ch in str(key or "") if ch.isalnum())


def build_normalized_tabular_index(row: Mapping[Any, Any]) -> dict[str, Any]:
    """Build normalized-header -> value index for alias-based extraction."""
    return {normalize_tabular_key(key): value for key, value in row.items()}


def get_tabular_value(
    row: Mapping[Any, Any],
    key: str,
    default: Any = "",
) -> Any:
    """Get one value by exact header key, tolerant to accidental surrounding spaces."""
    if key in row:
        return row[key]
    spaced_key = f" {key} "
    if spaced_key in row:
        return row[spaced_key]
    return default


def get_tabular_value_by_aliases(
    row: Mapping[Any, Any],
    aliases: Sequence[str],
    default: Any = "",
    normalized_index: Mapping[str, Any] | None = None,
) -> Any:
    """Get one value by trying multiple header aliases and normalized-header fallbacks."""
    index = normalized_index if normalized_index is not None else build_normalized_tabular_index(row)
    for alias in aliases:
        direct = get_tabular_value(row, alias, None)
        if direct is not None:
            return direct
        candidate = index.get(normalize_tabular_key(alias))
        if candidate is not None:
            return candidate
    return default


def clean_tabular_text_value(
    value: Any,
    empty_tokens: frozenset[str] = DEFAULT_TABULAR_EMPTY_TOKENS,
) -> str:
    """Normalize tabular values to stable string form for import DTOs."""
    if value is None:
        return ""
    if isinstance(value, float):
        if math.isnan(value):
            return ""
        if value.is_integer():
            return str(int(value))
    text = str(value).strip()
    return "" if text.lower() in empty_tokens else text


def set_if_not_empty(target: MutableMapping[str, Any], key: str, value: Any) -> None:
    """Set one mapping key only when the incoming value is not empty."""
    if value is None:
        return
    if isinstance(value, str) and not value.strip():
        return
    target[key] = value
