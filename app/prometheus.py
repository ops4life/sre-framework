import os

import httpx

PROMETHEUS_URL = os.getenv("PROMETHEUS_URL", "http://prometheus:9090")


async def instant_query(query: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(f"{PROMETHEUS_URL}/api/v1/query", params={"query": query})
        resp.raise_for_status()
        return resp.json()["data"]["result"]


async def range_query(query: str, start: float, end: float, step: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{PROMETHEUS_URL}/api/v1/query_range",
            params={"query": query, "start": start, "end": end, "step": step},
        )
        resp.raise_for_status()
        return resp.json()["data"]["result"]
