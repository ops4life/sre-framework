import os
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

OVERVIEW = {"kpis": {}, "slo_table": [], "golden_signals": {}, "error_budget_burn": {}, "capacity": {}}


class TestHealth:
    def test_returns_ok(self):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}


class TestOverview:
    def test_calls_get_overview_no_service(self):
        with patch("app.main.metrics.get_overview", new_callable=AsyncMock, return_value=OVERVIEW) as mock:
            resp = client.get("/api/sre/overview")
        assert resp.status_code == 200
        mock.assert_awaited_once_with(None)

    def test_passes_service_param(self):
        with patch("app.main.metrics.get_overview", new_callable=AsyncMock, return_value=OVERVIEW) as mock:
            resp = client.get("/api/sre/overview?service=web")
        assert resp.status_code == 200
        mock.assert_awaited_once_with("web")

    def test_returns_overview_body(self):
        with patch("app.main.metrics.get_overview", new_callable=AsyncMock, return_value=OVERVIEW):
            resp = client.get("/api/sre/overview")
        assert resp.json() == OVERVIEW


class TestSpa:
    def test_unknown_path_no_dist_returns_404(self):
        with patch("app.main.os.path.isfile", return_value=False):
            resp = client.get("/some/unknown/path")
        assert resp.status_code == 404
        assert resp.json() == {"detail": "not found"}

    def test_root_no_dist_returns_404(self):
        with patch("app.main.os.path.isfile", return_value=False):
            resp = client.get("/")
        assert resp.status_code == 404

    def test_existing_file_served(self, tmp_path):
        file = tmp_path / "app.js"
        file.write_text("console.log('hi')")
        real_isfile = os.path.isfile

        def selective_isfile(path):
            return str(file) == path or real_isfile(path)

        with patch("app.main.os.path.isfile", side_effect=selective_isfile), \
             patch("app.main.os.path.join", return_value=str(file)):
            resp = client.get("/app.js")
        assert resp.status_code == 200

    def test_missing_file_falls_back_to_index(self):
        from fastapi.responses import JSONResponse as JR

        def isfile(path):
            return path == "frontend/dist/index.html"

        with patch("app.main.os.path.isfile", side_effect=isfile), \
             patch("app.main.os.path.join", return_value="/nonexistent/app.js"), \
             patch("app.main.FileResponse", return_value=JR({"served": "index"})):
            resp = client.get("/app.js")
        assert resp.status_code == 200
