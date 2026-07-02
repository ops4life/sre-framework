import os
from functools import lru_cache
from pathlib import Path

import yaml

_DEFAULT_CONFIG = Path(__file__).parent / "config" / "sre.yaml"
_PROVIDERS_DIR = Path(__file__).parent / "config" / "providers"


def _load_yaml(path: Path) -> dict:
    return yaml.safe_load(path.read_text()) or {}


def _merge(base: dict, override: dict) -> dict:
    """Shallow-merge override into base; returns new dict."""
    return {**base, **override}


@lru_cache(maxsize=1)
def load_config() -> dict:
    cfg_path = Path(os.getenv("SRE_CONFIG_FILE", str(_DEFAULT_CONFIG)))
    cfg = _load_yaml(cfg_path)

    provider_name = cfg.get("provider", "http")
    provider_path = _PROVIDERS_DIR / f"{provider_name}.yaml"
    preset = _load_yaml(provider_path) if provider_path.exists() else {}

    # Merge user query overrides over preset queries
    preset_queries: dict = preset.get("queries", {})
    user_queries: dict = cfg.get("queries", {})
    merged_queries = _merge(preset_queries, user_queries)

    return {
        "provider": provider_name,
        "latency_unit": preset.get("latency_unit", "seconds"),
        "queries": merged_queries,
        "default_service": cfg.get("default_service"),
        "services": cfg.get("services", []),
        "dora": cfg.get("dora"),
    }


def render(key: str, labels: dict, **extra) -> str | None:
    """Return a formatted PromQL query string or None if key is not defined."""
    cfg = load_config()
    template = cfg["queries"].get(key)
    if template is None:
        return None
    ctx = {**labels, **extra}
    return template.format(**ctx)
