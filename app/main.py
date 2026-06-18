import json
import os
import re

import sentry_sdk
from fastapi import FastAPI
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from . import metrics

# Initialize Sentry if DSN is provided
sentry_dsn = os.getenv("SENTRY_DSN")
if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "1.0")),
    )

app = FastAPI()

_SRE_CONFIG = {
    "title": os.getenv("SRE_TITLE", "SRE Ops — Mission Control"),
    "timezone": os.getenv("SRE_TIMEZONE", "UTC"),
    "window": os.getenv("SRE_WINDOW", "28d"),
    "favicon": os.getenv("SRE_FAVICON", "/favicon.png"),
    "accent": os.getenv("SRE_ACCENT", ""),
    "sentry_dsn": os.getenv("SENTRY_FRONTEND_DSN") or os.getenv("SENTRY_DSN", ""),
}


if os.path.isdir("frontend/dist/assets"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="frontend-assets")


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/sre/overview")
async def overview(service: str | None = None):
    return await metrics.get_overview(service)


@app.get("/{full_path:path}")
async def spa(full_path: str):
    if full_path:
        file_path = os.path.join("frontend/dist", full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
    dist_index = "frontend/dist/index.html"
    if os.path.isfile(dist_index):
        with open(dist_index) as f:
            html = f.read()
        script = f"<script>window.__SRE_CONFIG__={json.dumps(_SRE_CONFIG)};</script>"
        favicon = _SRE_CONFIG["favicon"]
        if favicon != "/favicon.png":
            html = re.sub(r'<link[^>]+rel="icon"[^>]*/>', f'<link rel="icon" href="{favicon}" />', html)
        html = html.replace("</head>", f"{script}</head>", 1)
        return HTMLResponse(html)
    return JSONResponse({"detail": "not found"}, status_code=404)
