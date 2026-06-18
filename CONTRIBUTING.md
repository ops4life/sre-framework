# Contributing

## Run the demo locally

```bash
docker compose -f demo/docker-compose.yml up --build
```

Dashboard at **http://localhost:8080** with synthetic metrics. No external infra needed.

## Run backend tests

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
pytest
```

## Add a provider preset

1. Create `app/config/providers/<name>.yaml` with `name`, `latency_unit`, and `queries`.
2. Add a test service in `demo/sre.demo.yaml` with `provider: <name>` and matching `labels`.
3. Verify the demo stack renders the new provider's panels correctly.
4. Add the preset to the table in `README.md`.

## Add an SRE concept

1. Add an entry to `frontend/src/content/concepts.ts` with `id`, `term`, `plain`, `computedAs`, `anchor`.
2. Add the corresponding section to `CONCEPTS.md`.
3. Place `<InfoTip conceptId="your_id" />` next to the relevant label in the component.

## Code style

- Backend: `ruff` for linting, standard Python type hints.
- Frontend: TypeScript strict, no `any`, prefer inline styles (matching existing pattern).
- No hardcoded hostnames, ports, or credentials — all config via env vars or `sre.yaml`.
