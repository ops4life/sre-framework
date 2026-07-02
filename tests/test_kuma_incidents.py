import sqlite3
import time
from datetime import datetime, timedelta, timezone

import pytest

from app.kuma_incidents import get_incidents, _to_epoch


def _fmt(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d %H:%M:%S.000")


def _make_db(path, heartbeats):
    conn = sqlite3.connect(path)
    conn.execute(
        "CREATE TABLE heartbeat (id INTEGER PRIMARY KEY, monitor_id INTEGER, status INTEGER, "
        "time TEXT, important INTEGER)"
    )
    conn.executemany(
        "INSERT INTO heartbeat (monitor_id, status, time, important) VALUES (?, ?, ?, ?)",
        heartbeats,
    )
    conn.commit()
    conn.close()


class TestToEpoch:
    def test_parses_with_millis(self):
        assert _to_epoch("2024-06-01 12:00:00.000") is not None

    def test_parses_without_millis(self):
        assert _to_epoch("2024-06-01 12:00:00") is not None

    def test_invalid_returns_none(self):
        assert _to_epoch("not-a-date") is None


class TestGetIncidents:
    def test_missing_db_returns_empty(self, monkeypatch, tmp_path):
        monkeypatch.setenv("SRE_KUMA_DB_PATH", str(tmp_path / "nope.db"))
        import importlib
        import app.kuma_incidents as mod
        importlib.reload(mod)
        assert mod.get_incidents(28) == []

    def test_down_up_pair_becomes_incident(self, monkeypatch, tmp_path):
        db_path = tmp_path / "kuma.db"
        now = datetime.now(timezone.utc)
        down_time = now.replace(microsecond=0)
        up_time = down_time + timedelta(minutes=10)
        _make_db(str(db_path), [
            (1, 0, _fmt(down_time), 1),  # DOWN, important
            (1, 1, _fmt(up_time), 1),    # UP, important
        ])
        monkeypatch.setenv("SRE_KUMA_DB_PATH", str(db_path))
        import importlib
        import app.kuma_incidents as mod
        importlib.reload(mod)

        incidents = mod.get_incidents(28)

        assert len(incidents) == 1
        assert incidents[0]["monitor_id"] == 1
        assert incidents[0]["duration_sec"] is not None
        assert incidents[0]["duration_sec"] >= 0

    def test_ongoing_down_has_no_end(self, monkeypatch, tmp_path):
        db_path = tmp_path / "kuma.db"
        now = datetime.now(timezone.utc)
        _make_db(str(db_path), [
            (2, 0, _fmt(now), 1),
        ])
        monkeypatch.setenv("SRE_KUMA_DB_PATH", str(db_path))
        import importlib
        import app.kuma_incidents as mod
        importlib.reload(mod)

        incidents = mod.get_incidents(28)

        assert len(incidents) == 1
        assert incidents[0]["ended_at"] is None
        assert incidents[0]["duration_sec"] is None

    def test_unimportant_rows_ignored(self, monkeypatch, tmp_path):
        db_path = tmp_path / "kuma.db"
        now = datetime.now(timezone.utc)
        _make_db(str(db_path), [
            (3, 0, _fmt(now), 0),  # not important — should be ignored
        ])
        monkeypatch.setenv("SRE_KUMA_DB_PATH", str(db_path))
        import importlib
        import app.kuma_incidents as mod
        importlib.reload(mod)

        assert mod.get_incidents(28) == []

    def test_old_incident_outside_window_excluded(self, monkeypatch, tmp_path):
        db_path = tmp_path / "kuma.db"
        old = datetime(2000, 1, 1, tzinfo=timezone.utc)
        _make_db(str(db_path), [
            (4, 0, _fmt(old), 1),
        ])
        monkeypatch.setenv("SRE_KUMA_DB_PATH", str(db_path))
        import importlib
        import app.kuma_incidents as mod
        importlib.reload(mod)

        assert mod.get_incidents(28) == []
