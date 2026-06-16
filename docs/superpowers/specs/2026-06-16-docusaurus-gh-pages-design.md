# Docusaurus GitHub Pages Site — Design Spec

**Date:** 2026-06-16  
**Status:** Approved

---

## Goal

Deploy a public-facing GitHub Pages site at `https://ops4life.github.io/sre-framework/` using Docusaurus with a custom React landing page, full docs section, and SRE concepts primer.

---

## Approach

Docusaurus `@docusaurus/preset-classic` + custom React landing page (`src/pages/index.tsx`). Content sourced from existing README, CONCEPTS.md, and CONTRIBUTING.md. Auto-deployed via GitHub Actions on every push to `main`.

---

## Directory Structure

```
website/
├── docusaurus.config.ts
├── sidebars.ts
├── package.json                 # pnpm workspace, Docusaurus deps
├── static/
│   └── img/
│       ├── banner.svg           # copied from assets/banner.svg
│       ├── favicon.svg          # copied from frontend/public/favicon.svg
│       ├── favicon-light.svg    # copied from frontend/public/favicon-light.svg
│       └── favicon-dark.svg     # copied from frontend/public/favicon-dark.svg
├── src/
│   ├── pages/
│   │   └── index.tsx            # custom landing page
│   ├── components/
│   │   └── HomepageHero/
│   │       ├── index.tsx        # hero + feature grid
│   │       └── styles.module.css
│   └── css/
│       └── custom.css           # Docusaurus CSS token overrides
└── docs/
    ├── intro.md                 # quickstart (from README)
    ├── configuration.md         # sre.yaml, providers, query overrides
    ├── architecture.md          # data flow, backend, frontend breakdown
    ├── contributing.md          # content from CONTRIBUTING.md
    └── concepts/
        ├── index.md             # SRE primer intro
        ├── golden-signals.md    # latency, traffic, errors, saturation
        ├── slo-error-budget.md  # SLO/SLI/error budget
        └── capacity.md          # capacity planning signals
```

---

## Landing Page (`src/pages/index.tsx`)

### Hero section
- `banner.svg` centered at top
- Tagline: "Config-driven SRE dashboard. Prometheus-native. Zero-infra demo."
- Two CTAs: **Get Started** (`/docs/intro`) · **View on GitHub** (external)

### Feature grid (3 columns)
| Feature | Description |
|---------|-------------|
| Config-driven | Drop a `sre.yaml`, pick a provider preset, done. No PromQL hardcoded. |
| Zero-infra demo | `docker compose up` gives a live dashboard with synthetic metrics. |
| Learn Mode | Toggle concept tooltips on every panel — built-in SRE onboarding. |

---

## Docs Section

Sidebar structure:

```
Getting Started
  └── intro.md          (Quickstart)

Configuration
  └── configuration.md  (sre.yaml, providers, query overrides, env vars)

Architecture
  └── architecture.md   (data flow diagram, backend modules, frontend components)

Contributing
  └── contributing.md

SRE Concepts
  ├── index.md          (What is SRE?)
  ├── golden-signals.md
  ├── slo-error-budget.md
  └── capacity.md
```

---

## CI Workflow

File: `.github/workflows/deploy-docs.yml`

- **Trigger:** push to `main`
- **Steps:**
  1. `actions/checkout@v4`
  2. `pnpm/action-setup@v3` + `actions/setup-node@v4`
  3. `cd website && pnpm install && pnpm build`
  4. `peaceiris/actions-gh-pages@v3` — pushes `website/build/` to `gh-pages` branch
- **Permissions:** `contents: write` on the job
- **Separate from** existing `ci.yml` — docs deploy does not block or depend on Python/frontend CI

---

## GitHub Pages Config

- Source: `gh-pages` branch, `/ (root)`
- URL: `https://ops4life.github.io/sre-framework/`
- `baseUrl` in `docusaurus.config.ts`: `/sre-framework/`

---

## Out of Scope

- Blog section
- Versioned docs
- Algolia search (can add later)
- i18n
