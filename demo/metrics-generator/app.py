"""Synthetic metrics generator for the SRE framework demo.

Exposes /metrics (Prometheus format) with realistic randomized RED metrics
for three fake services: frontend, api, and worker.
A background thread updates counters/histograms every 5 seconds.
"""
import math
import random
import threading
import time

from prometheus_client import (
    Counter,
    Gauge,
    Histogram,
    start_http_server,
    REGISTRY,
)

SERVICES = [
    {"name": "frontend", "base_rate": 120, "base_latency": 0.045, "error_rate": 0.002,
     "base_container_cpu": 18.0, "base_container_mem": 42.0, "base_saturation": 12.0},
    {"name": "api",      "base_rate": 340, "base_latency": 0.095, "error_rate": 0.005,
     "base_container_cpu": 35.0, "base_container_mem": 58.0, "base_saturation": 28.0},
    {"name": "worker",   "base_rate": 20,  "base_latency": 0.280, "error_rate": 0.012,
     "base_container_cpu": 62.0, "base_container_mem": 71.0, "base_saturation": 55.0},
]

BUCKETS = (0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, float("inf"))

request_counter = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["service", "code"],
)
latency_hist = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency",
    ["service"],
    buckets=BUCKETS,
)
up_gauge = Gauge("up", "Service availability (1=up, 0=down)", ["job"])

vps_cpu_gauge = Gauge("demo_vps_cpu_percent", "VPS CPU usage %")
vps_mem_gauge = Gauge("demo_vps_memory_percent", "VPS memory usage %")
vps_disk_gauge = Gauge("demo_vps_disk_percent", "VPS disk usage %")
container_cpu_gauge = Gauge("demo_container_cpu_percent", "Container CPU usage %", ["service"])
container_mem_gauge = Gauge("demo_container_memory_percent", "Container memory usage %", ["service"])
saturation_gauge = Gauge("demo_saturation_percent", "Service saturation %", ["service"])


def _wave(t: float, period: float = 300, amplitude: float = 0.3) -> float:
    """Smooth sinusoidal variation around 1.0."""
    return 1.0 + amplitude * math.sin(2 * math.pi * t / period)


def _tick():
    t = time.time()
    for svc in SERVICES:
        name = svc["name"]
        wave = _wave(t, period=600 + random.uniform(-60, 60))

        # Request rate (Poisson-like per 5s tick)
        n_req = int(svc["base_rate"] * wave * 5 + random.gauss(0, 5))
        n_req = max(0, n_req)

        n_err = max(0, int(n_req * svc["error_rate"] * (1 + random.gauss(0, 0.5))))
        n_ok = n_req - n_err

        if n_ok > 0:
            request_counter.labels(service=name, code="200").inc(n_ok)
        if n_err > 0:
            request_counter.labels(service=name, code="500").inc(n_err)

        for _ in range(min(n_req, 100)):
            latency = max(0.001, random.lognormvariate(
                math.log(svc["base_latency"] * wave), 0.4
            ))
            latency_hist.labels(service=name).observe(latency)

        # Service is nearly always up; occasionally simulate a brief outage
        is_up = 1.0 if random.random() > 0.005 else 0.0
        up_gauge.labels(job=name).set(is_up)

        # Container CPU / memory / saturation — correlated with request wave
        cpu = svc["base_container_cpu"] * wave + random.gauss(0, 2.0)
        mem = svc["base_container_mem"] + random.gauss(0, 1.5)
        sat = svc["base_saturation"] * wave + random.gauss(0, 3.0)
        container_cpu_gauge.labels(service=name).set(max(0.1, min(cpu, 99.9)))
        container_mem_gauge.labels(service=name).set(max(0.1, min(mem, 99.9)))
        saturation_gauge.labels(service=name).set(max(0.0, min(sat, 100.0)))

    # VPS-level metrics (one set for the whole host, slow wave)
    vps_wave = _wave(t, period=900, amplitude=0.15)
    vps_cpu_gauge.set(max(0.1, min(48.0 * vps_wave + random.gauss(0, 2.0), 99.9)))
    vps_mem_gauge.set(max(0.1, min(63.0 + random.gauss(0, 1.0), 99.9)))
    # Disk creeps up very slowly, wraps around 40–70 %
    disk_base = 55.0 + 15.0 * math.sin(2 * math.pi * t / 86400)
    vps_disk_gauge.set(max(0.1, min(disk_base + random.gauss(0, 0.5), 99.9)))


def _loop():
    while True:
        try:
            _tick()
        except Exception as e:
            print(f"tick error: {e}")
        time.sleep(5)


if __name__ == "__main__":
    # Seed gauges immediately so Prometheus has data on first scrape
    for svc in SERVICES:
        up_gauge.labels(job=svc["name"]).set(1.0)
        request_counter.labels(service=svc["name"], code="200").inc(0)
        request_counter.labels(service=svc["name"], code="500").inc(0)
        latency_hist.labels(service=svc["name"])
        container_cpu_gauge.labels(service=svc["name"]).set(svc["base_container_cpu"])
        container_mem_gauge.labels(service=svc["name"]).set(svc["base_container_mem"])
        saturation_gauge.labels(service=svc["name"]).set(svc["base_saturation"])
    vps_cpu_gauge.set(48.0)
    vps_mem_gauge.set(63.0)
    vps_disk_gauge.set(55.0)

    t = threading.Thread(target=_loop, daemon=True)
    t.start()

    print("metrics-generator: serving /metrics on :8001")
    start_http_server(8001)
    # Block forever
    threading.Event().wait()
