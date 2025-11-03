# Accessibility and Diagnostics Audits

This project includes a self-contained audits pipeline to validate:
- Build stability and preview startup
- Headless browser diagnostics (console/network/screenshot)
- Automated accessibility checks with axe-core (running inside Chromium)
- Optional Lighthouse run via LHCI (if available)

## Run locally

- npm run audit

Artifacts are written to:
- ./lhci/axe-report.json — axe results (reporter v1)
- ./lhci/puppeteer-logs.json — console/logs, network, and errors
- /tmp/feelynx_puppeteer.png — page screenshot

Notes:
- The audits runner sets VITE_AUDIT_SHIM=true to expose window.React during builds, avoiding React global errors in headless.
- Supabase env vars are optional during audits; missing values are logged as warnings.

## CI

GitHub Actions workflow `.github/workflows/a11y-audits.yml` runs the audits on push/PR to `dev` and uploads artifacts.

Lighthouse CI is also configured in `.github/workflows/lighthouse.yml`. The audits runner will attempt `npx lhci autorun` but won't fail the job if LHCI is unavailable.
