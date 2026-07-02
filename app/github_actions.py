import calendar
import os
import time

import httpx

GITHUB_API_URL = os.getenv("GITHUB_API_URL", "https://api.github.com")


async def get_deploy_runs(repo: str, workflow_file: str, token_env: str, window_days: int) -> list[dict]:
    """Fetch completed runs of `workflow_file` in `repo` from the last `window_days`.

    Returns a list of dicts: {sha, created_at (epoch), conclusion, head_commit_at (epoch|None)}.
    Returns [] if the token env var is unset or the API call fails — callers treat
    missing DORA data the same way `config_loader.render()` treats a missing query key.
    """
    token = os.getenv(token_env)
    if not token:
        return []

    cutoff = time.time() - window_days * 86400
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    url = f"{GITHUB_API_URL}/repos/{repo}/actions/workflows/{workflow_file}/runs"

    runs: list[dict] = []
    page = 1
    async with httpx.AsyncClient(timeout=10, headers=headers) as client:
        while True:
            resp = await client.get(url, params={"status": "completed", "per_page": 100, "page": page})
            if resp.status_code != 200:
                break
            batch = resp.json().get("workflow_runs", [])
            if not batch:
                break

            stop = False
            for run in batch:
                created_at = _to_epoch(run.get("created_at"))
                if created_at is None or created_at < cutoff:
                    stop = True
                    continue
                head_commit = run.get("head_commit") or {}
                runs.append({
                    "sha": run.get("head_sha"),
                    "created_at": created_at,
                    "conclusion": run.get("conclusion"),
                    "head_commit_at": _to_epoch(head_commit.get("timestamp")),
                })
            if stop or len(batch) < 100:
                break
            page += 1

    return runs


def _to_epoch(iso_ts: str | None) -> float | None:
    if not iso_ts:
        return None
    return calendar.timegm(time.strptime(iso_ts, "%Y-%m-%dT%H:%M:%SZ"))
