"""Reusable helpers for asset labels and serial-style lookup keys."""

import re


def normalize_asset_key(value: str) -> str:
    """Normalize serial/asset values to compare labels with format noise removed."""
    return re.sub(r"[^a-z0-9]+", "", str(value or "").lower())


def is_asset_key_match(
    candidate_value: str,
    target_key: str,
    allow_candidate_prefix: bool = True,
) -> bool:
    """Check whether one candidate value matches a normalized target serial key."""
    normalized_target = normalize_asset_key(target_key)
    normalized_candidate = normalize_asset_key(candidate_value)
    if not normalized_target or not normalized_candidate:
        return False
    if normalized_candidate == normalized_target:
        return True
    if allow_candidate_prefix and normalized_candidate.startswith(normalized_target):
        return True
    return False


def extract_asset_number(label_or_number: str) -> str:
    """Extract canonical asset number from plain value or `number | description` label."""
    text = str(label_or_number or "").strip()
    if not text:
        return ""
    if "|" in text:
        return text.split("|", 1)[0].strip()
    return text


def build_asset_display_label(
    asset_number: str,
    description: str,
    max_length: int = 255,
) -> str:
    """Build display label used in selectors: `Asset Number | Description`."""
    number = extract_asset_number(asset_number)
    desc = str(description or "").strip()
    if not number:
        return ""
    if not desc:
        return number[:max_length]
    return f"{number} | {desc}"[:max_length]
