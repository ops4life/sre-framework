from unittest.mock import AsyncMock, patch

import pytest

from app.dora import (
    _tier,
    _deployment_frequency,
    _lead_time_for_changes,
    _correlate_failures,
    get_dora_metrics,
)


class TestTier:
    def test_none_value_returns_none(self):
        assert _tier(None, {"elite": 1, "high": 0.5, "medium": 0.1}, higher_is_better=True) is None

    def test_higher_is_better_buckets(self):
        thresholds = {"elite": 1.0, "high": 0.5, "medium": 0.1}
        assert _tier(2.0, thresholds, higher_is_better=True) == "elite"
        assert _tier(0.6, thresholds, higher_is_better=True) == "high"
        assert _tier(0.2, thresholds, higher_is_better=True) == "medium"
        assert _tier(0.01, thresholds, higher_is_better=True) == "low"

    def test_lower_is_better_buckets(self):
        thresholds = {"elite": 3600, "high": 86400, "medium": 604800}
        assert _tier(1000, thresholds, higher_is_better=False) == "elite"
        assert _tier(50000, thresholds, higher_is_better=False) == "high"
        assert _tier(500000, thresholds, higher_is_better=False) == "medium"
        assert _tier(9999999, thresholds, higher_is_better=False) == "low"


def _run(created_at, conclusion="success", head_commit_at=None):
    return {"sha": "x", "created_at": created_at, "conclusion": conclusion, "head_commit_at": head_commit_at}


class TestDeploymentFrequency:
    def test_counts_only_successful(self):
        runs = [_run(1000), _run(2000, conclusion="failure"), _run(3000)]
        result = _deployment_frequency(runs, window_days=28)
        assert result["total_deploys"] == 2
        assert result["deploys_per_day"] == pytest.approx(2 / 28, abs=0.001)

    def test_elite_tier_for_daily_deploys(self):
        runs = [_run(i) for i in range(30)]  # 30 successful deploys in 28 days
        result = _deployment_frequency(runs, window_days=28)
        assert result["tier"] == "elite"

    def test_empty_runs(self):
        result = _deployment_frequency([], window_days=28)
        assert result["total_deploys"] == 0
        assert result["tier"] == "low"


class TestLeadTimeForChanges:
    def test_median_of_successful_deltas(self):
        runs = [
            _run(created_at=2000, head_commit_at=1000),  # 1000s lead time
            _run(created_at=5000, head_commit_at=1000),  # 4000s lead time
            _run(created_at=1000, conclusion="failure", head_commit_at=500),  # excluded
        ]
        result = _lead_time_for_changes(runs)
        assert result["sample_size"] == 2
        assert result["median_seconds"] == 2500

    def test_no_commit_timestamp_excluded(self):
        runs = [_run(created_at=2000, head_commit_at=None)]
        result = _lead_time_for_changes(runs)
        assert result["sample_size"] == 0
        assert result["median_seconds"] is None
        assert result["tier"] is None

    def test_negative_delta_excluded(self):
        # head_commit_at after created_at shouldn't happen but must not produce negative lead time
        runs = [_run(created_at=1000, head_commit_at=2000)]
        result = _lead_time_for_changes(runs)
        assert result["sample_size"] == 0


class TestCorrelateFailures:
    def test_no_successful_runs(self):
        result = _correlate_failures([], [], correlation_window_sec=3600)
        assert result["change_failure_rate_pct"] is None
        assert result["mean_time_to_recovery_seconds"] is None

    def test_incident_within_window_counts_as_failure(self):
        runs = [_run(created_at=1000)]
        incidents = [{"monitor_id": 1, "started_at": 1500, "ended_at": 1800, "duration_sec": 300}]
        result = _correlate_failures(runs, incidents, correlation_window_sec=3600)
        assert result["failed_deploys"] == 1
        assert result["change_failure_rate_pct"] == 100.0
        assert result["mean_time_to_recovery_seconds"] == 300

    def test_incident_outside_window_not_counted(self):
        runs = [_run(created_at=1000)]
        incidents = [{"monitor_id": 1, "started_at": 999999, "ended_at": 1000100, "duration_sec": 100}]
        result = _correlate_failures(runs, incidents, correlation_window_sec=3600)
        assert result["failed_deploys"] == 0
        assert result["change_failure_rate_pct"] == 0.0
        assert result["mean_time_to_recovery_seconds"] is None

    def test_incident_before_deploy_not_counted(self):
        runs = [_run(created_at=5000)]
        incidents = [{"monitor_id": 1, "started_at": 1000, "ended_at": 1300, "duration_sec": 300}]
        result = _correlate_failures(runs, incidents, correlation_window_sec=3600)
        assert result["failed_deploys"] == 0


class TestGetDoraMetrics:
    async def test_no_repo_configured_returns_all_none(self):
        with patch("app.dora.cfg.load_config", return_value={"dora": None}):
            result = await get_dora_metrics()
        assert result["deployment_frequency"] is None
        assert result["lead_time_for_changes"] is None

    async def test_full_shape_with_data(self):
        config = {"dora": {"repo": "ops4life/vps-apps", "workflow_file": "deploy.yml", "window_days": 28}}
        runs = [_run(created_at=2000, head_commit_at=1000)]
        with patch("app.dora.cfg.load_config", return_value=config), \
             patch("app.dora.gha.get_deploy_runs", AsyncMock(return_value=runs)), \
             patch("app.dora.kuma.get_incidents", return_value=[]):
            result = await get_dora_metrics()
        assert result["deployment_frequency"]["total_deploys"] == 1
        assert result["lead_time_for_changes"]["sample_size"] == 1
        assert result["change_failure_rate"]["pct"] == 0.0
        assert result["mean_time_to_recovery"]["seconds"] is None
