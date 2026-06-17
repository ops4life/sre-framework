import pytest
import httpx
from pytest_httpx import HTTPXMock

from app.prometheus import instant_query, range_query, PROMETHEUS_URL


FAKE_RESULT = [{"metric": {}, "value": [1700000000, "42.0"]}]


def _instant_response(result=None):
    return {"status": "success", "data": {"resultType": "vector", "result": FAKE_RESULT if result is None else result}}


def _range_response(result=None):
    return {"status": "success", "data": {"resultType": "matrix", "result": FAKE_RESULT if result is None else result}}


class TestInstantQuery:
    async def test_returns_result(self, httpx_mock: HTTPXMock):
        httpx_mock.add_response(json=_instant_response())
        result = await instant_query("up")
        assert result == FAKE_RESULT

    async def test_correct_url_and_params(self, httpx_mock: HTTPXMock):
        httpx_mock.add_response(json=_instant_response())
        await instant_query("my_metric{job=\"svc\"}")
        req = httpx_mock.get_request()
        assert req.url.host == "prometheus"
        assert req.url.path == "/api/v1/query"
        assert "my_metric" in req.url.params["query"]

    async def test_empty_result(self, httpx_mock: HTTPXMock):
        httpx_mock.add_response(json=_instant_response(result=[]))
        result = await instant_query("up")
        assert result == []

    async def test_http_error_raises(self, httpx_mock: HTTPXMock):
        httpx_mock.add_response(status_code=500)
        with pytest.raises(httpx.HTTPStatusError):
            await instant_query("up")


class TestRangeQuery:
    async def test_returns_result(self, httpx_mock: HTTPXMock):
        httpx_mock.add_response(json=_range_response())
        result = await range_query("up", 0.0, 3600.0, "1m")
        assert result == FAKE_RESULT

    async def test_correct_url_and_params(self, httpx_mock: HTTPXMock):
        httpx_mock.add_response(json=_range_response())
        await range_query("rate(req[5m])", 1000.0, 2000.0, "5m")
        req = httpx_mock.get_request()
        assert req.url.path == "/api/v1/query_range"
        params = req.url.params
        assert "rate(req[5m])" in params["query"]
        assert params["step"] == "5m"

    async def test_empty_result(self, httpx_mock: HTTPXMock):
        httpx_mock.add_response(json=_range_response(result=[]))
        result = await range_query("up", 0.0, 1.0, "1m")
        assert result == []

    async def test_http_error_raises(self, httpx_mock: HTTPXMock):
        httpx_mock.add_response(status_code=503)
        with pytest.raises(httpx.HTTPStatusError):
            await range_query("up", 0.0, 1.0, "1m")
