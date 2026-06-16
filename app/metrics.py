import time

from . import config_loader as cfg
from . import prometheus as prom


def _scalar(result: list[dict]) -> float | None:
    if not result:
        return None
    value = result[0]["value"][1]
    return None if value == "NaN" else float(value)


def _series(result: list[dict]) -> list[float]:
    if not result:
        return []
    return [0.0 if v == "NaN" else float(v) for _, v in result[0]["values"]]


def _error_budget_remaining(sli: float | None, target: float) -> float | None:
    if sli is None:
        return None
    budget = 100 - target
    if budget <= 0:
        return 0.0
    burned = max(0.0, 100 - sli)
    return round(max(0.0, 1 - burned / budget) * 100, 1)


async def _query_scalar(key: str, labels: dict, **extra) -> float | None:
    q = cfg.render(key, labels, **extra)
    if q is None:
        return None
    return _scalar(await prom.instant_query(q))


async def _query_series(key: str, labels: dict, start: float, end: float, step: str, **extra) -> list[float]:
    q = cfg.render(key, labels, **extra)
    if q is None:
        return []
    return _series(await prom.range_query(q, start, end, step))


async def _availability(labels: dict, window: str) -> float | None:
    return await _query_scalar("availability", labels, window=window)


async def _availability_sparkline(labels: dict, hours: int = 24) -> list[float]:
    now = time.time()
    return await _query_series("availability", labels, now - hours * 3600, now, "1h", window="1h")


async def get_slo_table() -> list[dict]:
    rows = []
    for svc in cfg.load_config()["services"]:
        labels = svc["labels"]
        sli = await _availability(labels, "28d")
        rows.append({
            "name": svc["name"],
            "slo_target": svc["slo_target"],
            "sli": round(sli, 2) if sli is not None else None,
            "error_budget_remaining": _error_budget_remaining(sli, svc["slo_target"]),
            "sparkline": await _availability_sparkline(labels),
        })
    return rows


async def get_golden_signals(svc: dict) -> dict:
    labels = svc["labels"]
    config = cfg.load_config()
    latency_unit = config["latency_unit"]

    now = time.time()
    start = now - 40 * 300  # ~40 points at 5m step

    req_rate = await _query_scalar("request_rate", labels)
    p99_raw = await _query_scalar("latency_p99", labels)
    error_pct = await _query_scalar("error_rate", labels)
    saturation = await _query_scalar("saturation", labels)

    p99_ms = round(p99_raw * 1000, 1) if p99_raw is not None and latency_unit == "seconds" else (
        round(p99_raw, 1) if p99_raw is not None else None
    )

    lat_series_raw = await _query_series("latency_p99", labels, start, now, "5m")
    lat_series = [v * 1000 for v in lat_series_raw] if latency_unit == "seconds" else lat_series_raw

    return {
        "latency_p99_ms": p99_ms,
        "request_rate": round(req_rate, 2) if req_rate is not None else None,
        "error_rate_pct": round(error_pct, 3) if error_pct is not None else 0.0,
        "saturation_pct": round(saturation, 1) if saturation is not None else None,
        "series": {
            "latency_p99_ms": lat_series,
            "request_rate": await _query_series("request_rate", labels, start, now, "5m"),
            "error_rate_pct": await _query_series("error_rate", labels, start, now, "5m"),
            "saturation_pct": await _query_series("saturation", labels, start, now, "5m"),
        },
    }


async def get_error_budget_burn(svc: dict) -> dict:
    labels = svc["labels"]
    target = svc["slo_target"]
    budget = 100 - target

    now = time.time()
    curve = await _query_series("availability", labels, now - 28 * 86400, now, "1d", window="1d")

    remaining_pct = None
    if curve and budget > 0:
        burned = max(0.0, 100 - curve[-1])
        remaining_pct = round(max(0.0, 1 - burned / budget) * 100, 1)

    async def burn_rate(window: str) -> float | None:
        sli = await _availability(labels, window)
        if sli is None or budget <= 0:
            return None
        return round(((100 - sli) / 100) / (budget / 100), 2)

    return {
        "target": target,
        "budget_pct": budget,
        "remaining_pct": remaining_pct,
        "burn_curve": curve,
        "burn_rate_1h": await burn_rate("1h"),
        "burn_rate_6h": await burn_rate("6h"),
    }


async def get_capacity(svc: dict) -> dict:
    labels = svc["labels"]
    return {
        "vps_cpu_pct": await _query_scalar("cap_vps_cpu", labels),
        "vps_memory_pct": await _query_scalar("cap_vps_mem", labels),
        "vps_disk_pct": await _query_scalar("cap_vps_disk", labels),
        "service_container_cpu_pct": await _query_scalar("cap_container_cpu", labels),
        "service_container_memory_pct": await _query_scalar("cap_container_mem", labels),
    }


def _find_service(services: list[dict], name: str | None) -> dict:
    default = cfg.load_config()["default_service"]
    if name:
        for svc in services:
            if svc["name"] == name:
                return svc
    if default:
        for svc in services:
            if svc["name"] == default:
                return svc
    return services[0]


async def get_overview(service: str | None = None) -> dict:
    config = cfg.load_config()
    services = config["services"]
    selected = _find_service(services, service)

    slo_table = await get_slo_table()
    golden = await get_golden_signals(selected)
    burn = await get_error_budget_burn(selected)
    capacity = await get_capacity(selected)

    slis = [r["sli"] for r in slo_table if r["sli"] is not None]
    budgets = [r["error_budget_remaining"] for r in slo_table if r["error_budget_remaining"] is not None]

    kpis = {
        "composite_slo": round(sum(slis) / len(slis), 2) if slis else None,
        "error_budget_remaining_pct": round(sum(budgets) / len(budgets), 1) if budgets else None,
        "selected_service": selected["name"],
        "selected_request_rate": golden["request_rate"],
        "selected_latency_p99_ms": golden["latency_p99_ms"],
        "selected_error_rate_pct": golden["error_rate_pct"],
    }

    return {
        "kpis": kpis,
        "slo_table": slo_table,
        "golden_signals": golden,
        "error_budget_burn": burn,
        "capacity": capacity,
        "generated_at": time.time(),
    }
