# End-to-End Testing Guide

This project uses [Playwright](https://playwright.dev/) for end-to-end (E2E) testing. The test suite exercises the most important user journeys — authentication, encrypted direct messaging, and the personalized dashboard — while stubbing all external services so the runs are deterministic.

## Installation

```bash
npm install
# Install the Playwright browser binaries once per machine
npx playwright install --with-deps chromium
```

> The `--with-deps` flag is only required on fresh containers or CI images that do not yet include Playwright's system dependencies.

## Running the tests

The Playwright configuration (`playwright.config.ts`) lives at the repository root. It automatically boots the Vite dev server on port `4173` before running the tests.

Available npm scripts:

```bash
npm run test:e2e      # Local development run with the HTML report
npm run test:e2e:ci   # CI-friendly run with a line reporter
```

### Useful environment variables

The following environment variables tweak the Playwright runner without requiring code changes:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PLAYWRIGHT_BASE_URL` | `http://127.0.0.1:4173` | Override the base URL that tests use. |
| `PLAYWRIGHT_WEB_SERVER_HOST` | `127.0.0.1` | Host passed to `npm run dev` when starting the Vite server. |
| `PLAYWRIGHT_WEB_SERVER_PORT` | `4173` | Port passed to `npm run dev`. |

## Service stubs

The shared Playwright fixture (`tests/e2e/fixtures.ts`) installs deterministic mocks for:

- **Supabase Auth** – all `/auth/v1/*` calls resolve against in-memory payloads so no network access is required.
- **WebSockets** – the browser `WebSocket` API is replaced with a benign mock to avoid connecting to the real LiveKit or websocket services.
- **DM API** – the chat spec (`tests/e2e/chat.spec.ts`) owns an in-memory message store and responds to the `/dm/**` REST endpoints, including read receipts.

Because these stubs cover every external dependency, no Docker services or `.env` secrets are required to run the suite locally or in CI.

## Artifacts

- HTML reports are written to `playwright-report/`.
- On failure, Playwright preserves traces and videos to help with debugging.
