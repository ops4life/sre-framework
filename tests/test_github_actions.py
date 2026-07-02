import time

from app.github_actions import get_deploy_runs, _to_epoch


def _run(sha="abc123", created_at="2024-06-01T12:00:00Z", conclusion="success", commit_at="2024-06-01T11:00:00Z"):
    return {
        "head_sha": sha,
        "created_at": created_at,
        "conclusion": conclusion,
        "head_commit": {"timestamp": commit_at} if commit_at else None,
    }


class TestToEpoch:
    def test_none_returns_none(self):
        assert _to_epoch(None) is None

    def test_parses_utc_iso(self):
        assert _to_epoch("2024-06-01T12:00:00Z") == 1717243200.0


class TestGetDeployRuns:
    async def test_missing_token_returns_empty(self, monkeypatch):
        monkeypatch.delenv("SRE_GITHUB_TOKEN", raising=False)
        result = await get_deploy_runs("ops4life/vps-apps", "deploy.yml", "SRE_GITHUB_TOKEN", 28)
        assert result == []

    async def test_parses_runs(self, monkeypatch, httpx_mock):
        monkeypatch.setenv("SRE_GITHUB_TOKEN", "fake-token")
        now = time.time()
        recent_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))
        httpx_mock.add_response(json={"workflow_runs": [_run(created_at=recent_iso)]})

        result = await get_deploy_runs("ops4life/vps-apps", "deploy.yml", "SRE_GITHUB_TOKEN", 28)

        assert len(result) == 1
        assert result[0]["sha"] == "abc123"
        assert result[0]["conclusion"] == "success"
        assert result[0]["head_commit_at"] is not None

    async def test_stops_at_window_cutoff(self, monkeypatch, httpx_mock):
        monkeypatch.setenv("SRE_GITHUB_TOKEN", "fake-token")
        old_iso = "2000-01-01T00:00:00Z"
        httpx_mock.add_response(json={"workflow_runs": [_run(created_at=old_iso)]})

        result = await get_deploy_runs("ops4life/vps-apps", "deploy.yml", "SRE_GITHUB_TOKEN", 28)

        assert result == []

    async def test_http_error_returns_empty(self, monkeypatch, httpx_mock):
        monkeypatch.setenv("SRE_GITHUB_TOKEN", "fake-token")
        httpx_mock.add_response(status_code=401)

        result = await get_deploy_runs("ops4life/vps-apps", "deploy.yml", "SRE_GITHUB_TOKEN", 28)

        assert result == []

    async def test_sends_bearer_auth_header(self, monkeypatch, httpx_mock):
        monkeypatch.setenv("SRE_GITHUB_TOKEN", "fake-token")
        httpx_mock.add_response(json={"workflow_runs": []})

        await get_deploy_runs("ops4life/vps-apps", "deploy.yml", "SRE_GITHUB_TOKEN", 28)

        req = httpx_mock.get_request()
        assert req.headers["authorization"] == "Bearer fake-token"
