# Dependency Management

This document explains how we manage JavaScript dependencies across the Feelynx monorepo, including supported package managers, lockfile expectations, and the cadence for keeping packages up to date.

## Supported package managers

We officially support two package managers:

- **npm** is the primary tool for installs in CI and production. All scripts and Dockerfiles assume npm, and the `package-lock.json` file is the authoritative lockfile.
- **Bun** is optional for local development. It offers faster installs and runs via `bun install`/`bun run`, but should only be used with a compatible Bun release (see the `bun.lockb` file).

When adding or updating dependencies, use npm first to ensure the canonical lockfile is updated correctly:

```bash
npm install <package>@<version>
```

If you use Bun locally, immediately follow up with:

```bash
bun install --frozen-lockfile
```

and commit the resulting `bun.lockb` changes alongside `package-lock.json` so both environments stay in sync. Never edit either lockfile manually.

## Lockfile maintenance

- `package-lock.json` must be kept in sync with `package.json` at all times. CI runs `npm ci`, which fails if the lockfile and manifest drift.
- `bun.lockb` is generated automatically by Bun and captures the same dependency graph for developers who prefer Bun. Treat it as read-only and regenerate it with `bun install` after any npm change.
- Do not delete either lockfile unless explicitly discussed in an engineering retro; they help ensure reproducible builds across package managers.

## Continuous integration

The [`dependency-audit` job](../.github/workflows/ci.yml) runs on every push and pull request. It installs only production dependencies via `npm ci --omit=dev` and executes `npm audit --production --audit-level=high` to catch high-severity issues before merge. Keep the lockfiles up to date so that audits remain actionable and noise-free.

## Upgrade cadence & tooling

- **Monthly review:** During the first week of each month, run `npm outdated` to spot lagging packages, prioritize framework/runtime upgrades, and raise follow-up issues for larger migrations.
- **Security advisories:** Immediately evaluate any GitHub Dependabot or npm advisory affecting this repo. If a patch is available, apply it outside the regular cycle.
- **Tooling:**
  - Use `npm-check-updates` (`npx npm-check-updates -ui`) to stage bulk semver-safe bumps and regenerate `package-lock.json`.
  - Use `npm audit fix` for minor/patch-level security updates when the automated fix does not introduce breaking changes.
  - If you develop with Bun, run `bun update` after npm-driven upgrades to refresh `bun.lockb`, then rerun the test suite.

Document upgrade decisions in pull request descriptions so reviewers understand the scope of dependency changes.
