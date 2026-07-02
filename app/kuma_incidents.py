import os
import sqlite3
import time
from datetime import datetime, timezone

KUMA_DB_PATH = os.getenv("SRE_KUMA_DB_PATH", "/data/kuma.db")

# Uptime Kuma heartbeat.status values
_STATUS_DOWN = 0
_STATUS_UP = 1


def get_incidents(window_days: int) -> list[dict]:
    """Return incident windows derived from Kuma's heartbeat history.

    Each incident is a DOWN→UP pair of `important` heartbeats for the same monitor:
    {monitor_id, started_at (epoch), ended_at (epoch|None), duration_sec (float|None)}.
    An incident with ended_at=None is still ongoing.

    Returns [] if the DB file isn't mounted/readable — same "missing signal" contract
    as github_actions.get_deploy_runs().
    """
    if not os.path.exists(KUMA_DB_PATH):
        return []

    cutoff = time.time() - window_days * 86400
    try:
        conn = sqlite3.connect(f"file:{KUMA_DB_PATH}?mode=ro", uri=True)
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            """
            SELECT monitor_id, status, time
            FROM heartbeat
            WHERE important = 1
            ORDER BY monitor_id, time ASC
            """
        ).fetchall()
        conn.close()
    except sqlite3.Error:
        return []

    incidents: list[dict] = []
    open_down: dict[int, float] = {}
    for row in rows:
        ts = _to_epoch(row["time"])
        if ts is None:
            continue
        monitor_id = row["monitor_id"]
        if row["status"] == _STATUS_DOWN:
            open_down[monitor_id] = ts
        elif row["status"] == _STATUS_UP and monitor_id in open_down:
            started_at = open_down.pop(monitor_id)
            incidents.append({
                "monitor_id": monitor_id,
                "started_at": started_at,
                "ended_at": ts,
                "duration_sec": ts - started_at,
            })

    # Any DOWN still open at the end of history is an ongoing incident
    for monitor_id, started_at in open_down.items():
        incidents.append({
            "monitor_id": monitor_id,
            "started_at": started_at,
            "ended_at": None,
            "duration_sec": None,
        })

    return [i for i in incidents if i["started_at"] >= cutoff]


def _to_epoch(kuma_time: str) -> float | None:
    """Kuma stores heartbeat.time as a UTC datetime string, e.g. '2024-01-01 12:00:00.000'."""
    for fmt in ("%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%d %H:%M:%S"):
        try:
            dt = datetime.strptime(kuma_time, fmt).replace(tzinfo=timezone.utc)
            return dt.timestamp()
        except ValueError:
            continue
    return None
