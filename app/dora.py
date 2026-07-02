import statistics
import time

from . import config_loader as cfg
from . import github_actions as gha
from . import kuma_incidents as kuma

# DORA performance tiers, adapted from the 2021 Accelerate State of DevOps report.
# The official report's published ranges aren't perfectly contiguous (e.g. lead time
# jumps from "<1h" straight to "1 day-1 week"); these thresholds fill those gaps with
# monotonic boundaries so every measured value lands in exactly one tier.
_DEPLOY_FREQ_PER_DAY = {"elite": 1.0, "high": 1 / 7, "medium": 1 / 30}  # >= threshold
_LEAD_TIME_SEC = {"elite": 3600, "high": 7 * 86400, "medium": 180 * 86400}  # <= threshold
_CFR_PCT = {"elite": 15, "high": 30, "medium": 45}  # <= threshold
_MTTR_SEC = {"elite": 3600, "high": 86400, "medium": 7 * 86400}  # <= threshold

_SUCCESS_CONCLUSIONS = {"success"}
_FAILURE_CONCLUSIONS = {"failure", "timed_out", "cancelled"}


def _tier(value: float | None, thresholds: dict[str, float], higher_is_better: bool) -> str | None:
    if value is None:
        return None
    elite, high, medium = thresholds["elite"], thresholds["high"], thresholds["medium"]
    if higher_is_better:
        if value >= elite:
            return "elite"
        if value >= high:
            return "high"
        if value >= medium:
            return "medium"
        return "low"
    if value <= elite:
        return "elite"
    if value <= high:
        return "high"
    if value <= medium:
        return "medium"
    return "low"


def _deployment_frequency(runs: list[dict], window_days: int) -> dict:
    successful = [r for r in runs if r["conclusion"] in _SUCCESS_CONCLUSIONS]
    per_day = len(successful) / window_days if window_days else 0.0
    return {
        "deploys_per_day": round(per_day, 3),
        "total_deploys": len(successful),
        "tier": _tier(per_day, _DEPLOY_FREQ_PER_DAY, higher_is_better=True),
    }


def _lead_time_for_changes(runs: list[dict]) -> dict:
    successful = [r for r in runs if r["conclusion"] in _SUCCESS_CONCLUSIONS]
    deltas = [
        r["created_at"] - r["head_commit_at"]
        for r in successful
        if r["head_commit_at"] is not None and r["created_at"] >= r["head_commit_at"]
    ]
    median_sec = statistics.median(deltas) if deltas else None
    return {
        "median_seconds": round(median_sec) if median_sec is not None else None,
        "sample_size": len(deltas),
        "tier": _tier(median_sec, _LEAD_TIME_SEC, higher_is_better=False),
    }


def _correlate_failures(runs: list[dict], incidents: list[dict], correlation_window_sec: int) -> dict:
    successful = [r for r in runs if r["conclusion"] in _SUCCESS_CONCLUSIONS]
    if not successful:
        return {
            "change_failure_rate_pct": None,
            "cfr_tier": None,
            "mean_time_to_recovery_seconds": None,
            "mttr_tier": None,
            "failed_deploys": 0,
            "total_deploys": 0,
        }

    failed_deploy_count = 0
    recovery_durations: list[float] = []
    for run in successful:
        window_end = run["created_at"] + correlation_window_sec
        matches = [
            inc for inc in incidents
            if run["created_at"] <= inc["started_at"] <= window_end
        ]
        if matches:
            failed_deploy_count += 1
            recovery_durations.extend(
                inc["duration_sec"] for inc in matches if inc["duration_sec"] is not None
            )

    cfr_pct = round(100 * failed_deploy_count / len(successful), 1)
    mttr = statistics.mean(recovery_durations) if recovery_durations else None

    return {
        "change_failure_rate_pct": cfr_pct,
        "cfr_tier": _tier(cfr_pct, _CFR_PCT, higher_is_better=False),
        "mean_time_to_recovery_seconds": round(mttr) if mttr is not None else None,
        "mttr_tier": _tier(mttr, _MTTR_SEC, higher_is_better=False),
        "failed_deploys": failed_deploy_count,
        "total_deploys": len(successful),
    }


async def get_dora_metrics() -> dict:
    config = cfg.load_config()
    dora_cfg = config.get("dora") or {}

    repo = dora_cfg.get("repo")
    workflow_file = dora_cfg.get("workflow_file", "deploy.yml")
    token_env = dora_cfg.get("github_token_env", "SRE_GITHUB_TOKEN")
    window_days = dora_cfg.get("window_days", 28)
    correlation_window_min = dora_cfg.get("correlation_window_min", 60)

    if not repo:
        return {
            "deployment_frequency": None,
            "lead_time_for_changes": None,
            "change_failure_rate": None,
            "mean_time_to_recovery": None,
            "generated_at": time.time(),
        }

    runs = await gha.get_deploy_runs(repo, workflow_file, token_env, window_days)
    incidents = kuma.get_incidents(window_days)
    failure_stats = _correlate_failures(runs, incidents, correlation_window_min * 60)

    return {
        "deployment_frequency": _deployment_frequency(runs, window_days),
        "lead_time_for_changes": _lead_time_for_changes(runs),
        "change_failure_rate": {
            "pct": failure_stats["change_failure_rate_pct"],
            "tier": failure_stats["cfr_tier"],
            "failed_deploys": failure_stats["failed_deploys"],
            "total_deploys": failure_stats["total_deploys"],
        },
        "mean_time_to_recovery": {
            "seconds": failure_stats["mean_time_to_recovery_seconds"],
            "tier": failure_stats["mttr_tier"],
        },
        "generated_at": time.time(),
    }
