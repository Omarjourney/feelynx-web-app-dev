# Naming Conventions

UI components and classes should use PascalCase filenames to improve discoverability and maintain consistency across the codebase.

- Components / classes: `PascalCase` (e.g., `UserCard.tsx`, `LiveStreamHeader.tsx`)
- Hooks / utilities: `camelCase` (e.g., `useHealth.ts`, `validation.ts`)
- Constants: `UPPER_SNAKE_CASE`

You can run the filename check locally:

```
npm run lint:names
```

This script validates files under `src/components/**` and fails on non‑PascalCase.
