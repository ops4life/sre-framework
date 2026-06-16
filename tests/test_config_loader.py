import os
from pathlib import Path
import tempfile

import pytest
import yaml

# Point at the real providers dir; we'll write temp main configs
PROVIDERS_DIR = Path(__file__).parent.parent / "app" / "config" / "providers"


def _write_config(tmp_path: Path, content: dict) -> Path:
    p = tmp_path / "sre.yaml"
    p.write_text(yaml.dump(content))
    return p


def _load_with_config(cfg_path: Path):
    """Import fresh config_loader with env var pointing at cfg_path."""
    import importlib
    import sys
    os.environ["SRE_CONFIG_FILE"] = str(cfg_path)
    # Remove cached module + lru_cache so each test gets a clean loader
    for mod in list(sys.modules.keys()):
        if "config_loader" in mod:
            del sys.modules[mod]
    from app import config_loader
    config_loader.load_config.cache_clear()
    return config_loader


class TestTraefikPreset:
    def test_render_availability(self, tmp_path):
        cfg_path = _write_config(tmp_path, {
            "provider": "traefik",
            "default_service": "web",
            "services": [{"name": "web", "slo_target": 99.9, "labels": {"service": "web-svc@file", "container": "web"}}],
        })
        loader = _load_with_config(cfg_path)
        q = loader.render("availability", {"service": "web-svc@file", "container": "web"}, window="28d")
        assert "web-svc@file" in q
        assert "28d" in q
        assert "traefik_service_server_up" in q

    def test_render_request_rate(self, tmp_path):
        cfg_path = _write_config(tmp_path, {
            "provider": "traefik",
            "default_service": "web",
            "services": [{"name": "web", "slo_target": 99.9, "labels": {"service": "web-svc@file", "container": "web"}}],
        })
        loader = _load_with_config(cfg_path)
        q = loader.render("request_rate", {"service": "web-svc@file", "container": "web"})
        assert "traefik_service_requests_total" in q
        assert "web-svc@file" in q

    def test_latency_unit_is_seconds(self, tmp_path):
        cfg_path = _write_config(tmp_path, {
            "provider": "traefik",
            "default_service": "web",
            "services": [],
        })
        loader = _load_with_config(cfg_path)
        assert loader.load_config()["latency_unit"] == "seconds"

    def test_cap_keys_present(self, tmp_path):
        cfg_path = _write_config(tmp_path, {
            "provider": "traefik",
            "default_service": "web",
            "services": [],
        })
        loader = _load_with_config(cfg_path)
        for key in ("cap_vps_cpu", "cap_vps_mem", "cap_vps_disk", "cap_container_cpu", "cap_container_mem"):
            assert loader.render(key, {"container": "myapp"}) is not None, f"missing key: {key}"


class TestHttpPreset:
    def test_missing_cap_returns_none(self, tmp_path):
        cfg_path = _write_config(tmp_path, {
            "provider": "http",
            "default_service": "api",
            "services": [{"name": "api", "slo_target": 99.0, "labels": {"service": "api"}}],
        })
        loader = _load_with_config(cfg_path)
        assert loader.render("cap_vps_cpu", {"service": "api"}) is None
        assert loader.render("saturation", {"service": "api"}) is None

    def test_availability_uses_up_metric(self, tmp_path):
        cfg_path = _write_config(tmp_path, {
            "provider": "http",
            "default_service": "api",
            "services": [],
        })
        loader = _load_with_config(cfg_path)
        q = loader.render("availability", {"service": "my-api"}, window="7d")
        assert 'up{job="my-api"}' in q
        assert "7d" in q


class TestQueryOverrides:
    def test_user_override_replaces_preset_key(self, tmp_path):
        custom_tpl = 'my_custom_metric{{service="{service}"}} * 100'
        cfg_path = _write_config(tmp_path, {
            "provider": "traefik",
            "default_service": "web",
            "services": [],
            "queries": {"availability": custom_tpl},
        })
        loader = _load_with_config(cfg_path)
        q = loader.render("availability", {"service": "svc"}, window="28d")
        assert "my_custom_metric" in q
        assert "traefik_service_server_up" not in q

    def test_user_adds_new_key(self, tmp_path):
        cfg_path = _write_config(tmp_path, {
            "provider": "http",
            "default_service": "api",
            "services": [],
            "queries": {"my_signal": 'some_metric{{job="{service}"}}'},
        })
        loader = _load_with_config(cfg_path)
        q = loader.render("my_signal", {"service": "svc"})
        assert "some_metric" in q

    def test_unknown_key_returns_none(self, tmp_path):
        cfg_path = _write_config(tmp_path, {
            "provider": "http",
            "default_service": "api",
            "services": [],
        })
        loader = _load_with_config(cfg_path)
        assert loader.render("nonexistent_key", {"service": "svc"}) is None
