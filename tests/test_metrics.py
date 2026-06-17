from unittest.mock import AsyncMock, patch, MagicMock

import pytest

from app.metrics import (
    _scalar,
    _series,
    _error_budget_remaining,
    _find_service,
    get_golden_signals,
    get_slo_table,
    get_error_budget_burn,
    get_capacity,
    get_overview,
)


# ---------------------------------------------------------------------------
# Pure helpers
# ---------------------------------------------------------------------------

class TestScalar:
    def test_empty_returns_none(self):
        assert _scalar([]) is None

    def test_nan_returns_none(self):
        assert _scalar([{"value": [0, "NaN"]}]) is None

    def test_valid_float(self):
        assert _scalar([{"value": [0, "99.5"]}]) == 99.5


class TestSeries:
    def test_empty_returns_empty_list(self):
        assert _series([]) == []

    def test_nan_becomes_zero(self):
        result = _series([{"values": [[0, "NaN"], [1, "NaN"]]}])
        assert result == [0.0, 0.0]

    def test_valid_values(self):
        result = _series([{"values": [[0, "1.0"], [1, "2.5"]]}])
        assert result == [1.0, 2.5]

    def test_mixed_nan_and_valid(self):
        result = _series([{"values": [[0, "NaN"], [1, "3.0"]]}])
        assert result == [0.0, 3.0]


class TestErrorBudgetRemaining:
    def test_none_sli_returns_none(self):
        assert _error_budget_remaining(None, 99.9) is None

    def test_zero_budget_returns_zero(self):
        assert _error_budget_remaining(99.0, 100.0) == 0.0

    def test_full_budget_remaining(self):
        assert _error_budget_remaining(100.0, 99.9) == 100.0

    def test_half_budget_burned(self):
        # target=99.0 → budget=1.0; sli=99.5 → burned=0.5 → 50% remaining
        assert _error_budget_remaining(99.5, 99.0) == 50.0

    def test_over_burn_clamps_to_zero(self):
        assert _error_budget_remaining(98.0, 99.9) == 0.0


class TestFindService:
    SERVICES = [
        {"name": "web", "labels": {}},
        {"name": "api", "labels": {}},
    ]

    def _with_config(self, default):
        return patch("app.metrics.cfg.load_config", return_value={"default_service": default, "services": self.SERVICES})

    def test_returns_named_service(self):
        with self._with_config("web"):
            svc = _find_service(self.SERVICES, "api")
        assert svc["name"] == "api"

    def test_falls_back_to_default(self):
        with self._with_config("api"):
            svc = _find_service(self.SERVICES, None)
        assert svc["name"] == "api"

    def test_falls_back_to_first_when_no_default(self):
        with self._with_config(None):
            svc = _find_service(self.SERVICES, None)
        assert svc["name"] == "web"

    def test_unknown_name_falls_back_to_default(self):
        with self._with_config("api"):
            svc = _find_service(self.SERVICES, "nonexistent")
        assert svc["name"] == "api"


# ---------------------------------------------------------------------------
# Async functions — mock prom and cfg at module level
# ---------------------------------------------------------------------------

SVC = {"name": "web", "slo_target": 99.9, "labels": {"service": "web", "container": "web"}}
CONFIG = {"services": [SVC], "default_service": "web", "latency_unit": "seconds"}


def _patch_prom(instant_val=None, range_val=None):
    instant = AsyncMock(return_value=instant_val or [])
    range_ = AsyncMock(return_value=range_val or [])
    return (
        patch("app.metrics.prom.instant_query", instant),
        patch("app.metrics.prom.range_query", range_),
        instant,
        range_,
    )


class TestGetGoldenSignals:
    async def test_latency_converted_seconds_to_ms(self):
        # p99 = 0.25s → should appear as 250.0ms
        instant = AsyncMock(side_effect=[
            [{"value": [0, "10.0"]}],   # request_rate
            [{"value": [0, "0.25"]}],   # latency_p99
            [{"value": [0, "0.5"]}],    # error_rate
            [],                          # saturation → None
        ])
        range_ = AsyncMock(side_effect=[
            [{"values": [[0, "0.1"]]}],  # latency series
            [],                           # request_rate series
            [],                           # error_rate series
            [],                           # saturation series
        ])
        with patch("app.metrics.prom.instant_query", instant), \
             patch("app.metrics.prom.range_query", range_), \
             patch("app.metrics.cfg.render", side_effect=lambda k, *a, **kw: f"query_{k}"), \
             patch("app.metrics.cfg.load_config", return_value=CONFIG):
            result = await get_golden_signals(SVC)
        assert result["latency_p99_ms"] == 250.0
        assert result["request_rate"] == 10.0
        assert result["saturation_pct"] is None
        assert result["series"]["latency_p99_ms"] == [100.0]

    async def test_none_render_skips_query(self):
        instant = AsyncMock(return_value=[])
        range_ = AsyncMock(return_value=[])
        with patch("app.metrics.prom.instant_query", instant), \
             patch("app.metrics.prom.range_query", range_), \
             patch("app.metrics.cfg.render", return_value=None), \
             patch("app.metrics.cfg.load_config", return_value=CONFIG):
            result = await get_golden_signals(SVC)
        instant.assert_not_called()
        assert result["latency_p99_ms"] is None
        assert result["error_rate_pct"] == 0.0


class TestGetSloTable:
    async def test_sli_and_budget_computed(self):
        # target=99.0 → budget=1.0%; sli=99.5 → burned=0.5% → 50% remaining
        svc_99 = {**SVC, "slo_target": 99.0}
        config_99 = {**CONFIG, "services": [svc_99]}
        instant = AsyncMock(return_value=[{"value": [0, "99.5"]}])
        range_ = AsyncMock(return_value=[])
        with patch("app.metrics.prom.instant_query", instant), \
             patch("app.metrics.prom.range_query", range_), \
             patch("app.metrics.cfg.render", return_value="q"), \
             patch("app.metrics.cfg.load_config", return_value=config_99):
            rows = await get_slo_table()
        assert len(rows) == 1
        row = rows[0]
        assert row["name"] == "web"
        assert row["sli"] == 99.5
        assert row["error_budget_remaining"] == 50.0

    async def test_none_sli_when_no_result(self):
        instant = AsyncMock(return_value=[])
        range_ = AsyncMock(return_value=[])
        with patch("app.metrics.prom.instant_query", instant), \
             patch("app.metrics.prom.range_query", range_), \
             patch("app.metrics.cfg.render", return_value="q"), \
             patch("app.metrics.cfg.load_config", return_value=CONFIG):
            rows = await get_slo_table()
        assert rows[0]["sli"] is None
        assert rows[0]["error_budget_remaining"] is None


class TestGetErrorBudgetBurn:
    async def test_burn_rate_computed(self):
        # availability instant returns 99.5% (burned 0.5%, budget 0.1%, burn rate = 5.0x)
        instant = AsyncMock(return_value=[{"value": [0, "99.5"]}])
        range_ = AsyncMock(return_value=[{"values": [[0, "99.5"]]}])
        with patch("app.metrics.prom.instant_query", instant), \
             patch("app.metrics.prom.range_query", range_), \
             patch("app.metrics.cfg.render", return_value="q"), \
             patch("app.metrics.cfg.load_config", return_value=CONFIG):
            result = await get_error_budget_burn(SVC)
        assert result["target"] == 99.9
        assert result["budget_pct"] == pytest.approx(0.1, abs=0.001)
        assert result["burn_rate_1h"] == pytest.approx(5.0, abs=0.1)

    async def test_no_curve_remaining_is_none(self):
        instant = AsyncMock(return_value=[])
        range_ = AsyncMock(return_value=[])
        with patch("app.metrics.prom.instant_query", instant), \
             patch("app.metrics.prom.range_query", range_), \
             patch("app.metrics.cfg.render", return_value="q"), \
             patch("app.metrics.cfg.load_config", return_value=CONFIG):
            result = await get_error_budget_burn(SVC)
        assert result["remaining_pct"] is None
        assert result["burn_rate_1h"] is None


class TestGetCapacity:
    async def test_all_keys_present(self):
        instant = AsyncMock(return_value=[{"value": [0, "42.0"]}])
        with patch("app.metrics.prom.instant_query", instant), \
             patch("app.metrics.cfg.render", return_value="q"):
            result = await get_capacity(SVC)
        assert set(result.keys()) == {
            "vps_cpu_pct", "vps_memory_pct", "vps_disk_pct",
            "service_container_cpu_pct", "service_container_memory_pct",
        }
        assert result["vps_cpu_pct"] == 42.0

    async def test_missing_query_returns_none(self):
        instant = AsyncMock(return_value=[])
        with patch("app.metrics.prom.instant_query", instant), \
             patch("app.metrics.cfg.render", return_value=None):
            result = await get_capacity(SVC)
        assert all(v is None for v in result.values())
        instant.assert_not_called()


class TestGetOverview:
    async def test_shape_and_composite_slo(self):
        instant = AsyncMock(return_value=[{"value": [0, "99.5"]}])
        range_ = AsyncMock(return_value=[])
        with patch("app.metrics.prom.instant_query", instant), \
             patch("app.metrics.prom.range_query", range_), \
             patch("app.metrics.cfg.render", return_value="q"), \
             patch("app.metrics.cfg.load_config", return_value=CONFIG):
            result = await get_overview("web")
        assert "kpis" in result
        assert "slo_table" in result
        assert "golden_signals" in result
        assert "error_budget_burn" in result
        assert "capacity" in result
        assert result["kpis"]["selected_service"] == "web"
        assert result["kpis"]["composite_slo"] == 99.5

    async def test_no_services_slo_is_none(self):
        config_no_svc = {**CONFIG, "services": [], "default_service": None}
        with patch("app.metrics.cfg.load_config", return_value=config_no_svc):
            with pytest.raises((IndexError, StopIteration, KeyError)):
                await get_overview(None)
