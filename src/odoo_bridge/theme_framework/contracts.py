from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List


def _default_mimetype(path: str) -> str:
    suffix = Path(path).suffix.lower()
    if suffix == ".css":
        return "text/css"
    if suffix == ".js":
        return "application/javascript"
    if suffix == ".xml":
        return "text/xml"
    return "application/octet-stream"


@dataclass(frozen=True)
class ThemeAssetSpec:
    name: str
    path: Path
    bundle: str = "web.assets_backend"
    directive: str = "append"
    sequence: int = 1800
    mimetype: str = "application/octet-stream"

    @classmethod
    def from_dict(cls, payload: Dict[str, Any]) -> "ThemeAssetSpec":
        path = Path(str(payload.get("path") or "").strip())
        if not path.as_posix():
            raise ValueError("Theme asset requires `path`")
        name = str(payload.get("name") or path.name).strip()
        if not name:
            raise ValueError("Theme asset requires `name`")
        bundle = str(payload.get("bundle") or "web.assets_backend").strip() or "web.assets_backend"
        directive = str(payload.get("directive") or "append").strip() or "append"
        sequence = int(payload.get("sequence") or 1800)
        mimetype = str(payload.get("mimetype") or _default_mimetype(path.as_posix())).strip()
        return cls(
            name=name,
            path=path,
            bundle=bundle,
            directive=directive,
            sequence=sequence,
            mimetype=mimetype,
        )


@dataclass(frozen=True)
class ThemeQWebViewSpec:
    name: str
    arch_path: Path | None = None
    arch_inline: str | None = None
    inherit_key: str | None = None
    mode: str = "extension"
    priority: int = 95

    @classmethod
    def from_dict(cls, payload: Dict[str, Any]) -> "ThemeQWebViewSpec":
        name = str(payload.get("name") or "").strip()
        if not name:
            raise ValueError("Theme qweb view requires `name`")
        arch_path_raw = str(payload.get("arch_path") or "").strip()
        arch_inline_raw = payload.get("arch_inline")
        arch_inline = str(arch_inline_raw).strip() if arch_inline_raw is not None else None
        arch_path = Path(arch_path_raw) if arch_path_raw else None
        if not arch_path and not arch_inline:
            raise ValueError("Theme qweb view requires `arch_path` or `arch_inline`")
        inherit_key_raw = str(payload.get("inherit_key") or "").strip()
        inherit_key = inherit_key_raw or None
        mode = str(payload.get("mode") or "extension").strip() or "extension"
        priority = int(payload.get("priority") or 95)
        return cls(
            name=name,
            arch_path=arch_path,
            arch_inline=arch_inline,
            inherit_key=inherit_key,
            mode=mode,
            priority=priority,
        )


@dataclass(frozen=True)
class ThemeSpec:
    key: str
    title: str
    description: str = ""
    inherits: tuple[str, ...] = field(default_factory=tuple)
    assets: tuple[ThemeAssetSpec, ...] = field(default_factory=tuple)
    qweb_views: tuple[ThemeQWebViewSpec, ...] = field(default_factory=tuple)
    params: Dict[str, str] = field(default_factory=dict)
    hosts: tuple[str, ...] = field(default_factory=tuple)

    @classmethod
    def from_dict(cls, payload: Dict[str, Any]) -> "ThemeSpec":
        key = str(payload.get("key") or "").strip()
        if not key:
            raise ValueError("Theme requires `key`")
        title = str(payload.get("title") or key).strip() or key
        description = str(payload.get("description") or "").strip()
        inherits = tuple(
            str(item).strip()
            for item in (payload.get("inherits") or [])
            if str(item).strip()
        )
        assets = tuple(
            ThemeAssetSpec.from_dict(item)
            for item in (payload.get("assets") or [])
            if isinstance(item, dict)
        )
        qweb_views = tuple(
            ThemeQWebViewSpec.from_dict(item)
            for item in (payload.get("qweb_views") or [])
            if isinstance(item, dict)
        )
        params_raw = payload.get("params") or {}
        params = {str(k): str(v) for k, v in params_raw.items()} if isinstance(params_raw, dict) else {}
        hosts = tuple(
            str(item).strip().lower()
            for item in (payload.get("hosts") or [])
            if str(item).strip()
        )
        return cls(
            key=key,
            title=title,
            description=description,
            inherits=inherits,
            assets=assets,
            qweb_views=qweb_views,
            params=params,
            hosts=hosts,
        )


@dataclass(frozen=True)
class ThemeCatalogSpec:
    version: str
    themes: Dict[str, ThemeSpec]
    metadata: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, payload: Dict[str, Any]) -> "ThemeCatalogSpec":
        version = str(payload.get("version") or "1").strip() or "1"
        raw_themes: List[Dict[str, Any]] = [
            item for item in (payload.get("themes") or []) if isinstance(item, dict)
        ]
        parsed = [ThemeSpec.from_dict(item) for item in raw_themes]
        theme_map = {theme.key: theme for theme in parsed}
        metadata = payload.get("metadata") or {}
        if not isinstance(metadata, dict):
            metadata = {}
        return cls(version=version, themes=theme_map, metadata=metadata)

