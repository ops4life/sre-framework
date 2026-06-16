import os

from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from . import metrics

app = FastAPI()

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
        return FileResponse(dist_index)
    return JSONResponse({"detail": "not found"}, status_code=404)
