"""Reusable helpers for legacy serial metadata parsing/normalization."""

import re
from typing import Any, Mapping

SERIAL_METADATA_KEYS: tuple[str, str, str] = ("psn", "esn", "vin")
SERIAL_METADATA_LABELS: Mapping[str, str] = {
    "psn": "PSN",
    "esn": "ESN",
    "vin": "VIN",
}
DEFAULT_EMPTY_TOKENS = frozenset({"none", "nan", "null"})


def normalize_legacy_metadata_value(
    value: Any,
    empty_tokens: frozenset[str] = DEFAULT_EMPTY_TOKENS,
) -> str:
    """Normalize metadata values from imports/legacy notes."""
    text = str(value or "").strip()
    if not text:
        return ""
    if text.lower() in empty_tokens:
        return ""
    return text


def coalesce_normalized_metadata_values(*values: Any) -> str:
    """Return the first normalized non-empty metadata value."""
    for value in values:
        cleaned = normalize_legacy_metadata_value(value)
        if cleaned:
            return cleaned
    return ""


def parse_serial_metadata_note(
    note_value: Any,
    labels: Mapping[str, str] = SERIAL_METADATA_LABELS,
) -> dict[str, str]:
    """Parse PSN/ESN/VIN values from legacy note formats."""
    text = str(note_value or "")
    parsed = {key: "" for key in labels}
    if not text:
        return parsed

    cleaned = re.sub(r"<[^>]+>", " ", text)
    cleaned = cleaned.replace("&nbsp;", " ")
    chunks = [chunk.strip() for chunk in re.split(r"[|\n\r]+", cleaned) if chunk.strip()]
    for chunk in chunks:
        upper = chunk.upper()
        for key, label in labels.items():
            marker = f"{label.upper()}:"
            if marker not in upper:
                continue
            if parsed[key]:
                break
            value = chunk.split(":", 1)[1].strip() if ":" in chunk else ""
            parsed[key] = normalize_legacy_metadata_value(value)
            break
    return parsed


def resolve_serial_metadata_overrides(
    incoming: Mapping[str, Any],
    existing: Mapping[str, Any],
    note_value: Any,
    existing_field_prefix: str = "x_",
    keys: tuple[str, ...] = SERIAL_METADATA_KEYS,
) -> dict[str, str]:
    """
    Resolve serial metadata with deterministic precedence.

    Priority per key:
    1) incoming value
    2) existing structured field (e.g. x_psn)
    3) parsed legacy note value
    """
    parsed_note = parse_serial_metadata_note(note_value)
    resolved: dict[str, str] = {}
    for key in keys:
        resolved[key] = coalesce_normalized_metadata_values(
            incoming.get(key),
            existing.get(f"{existing_field_prefix}{key}"),
            parsed_note.get(key),
        )
    return resolved
