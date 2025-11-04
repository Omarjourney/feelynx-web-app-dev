# Feelynx UI/UX Code Review Report

## Summary
- **Scope:** Full review of `/src` covering components, layouts, pages, hooks, stores, lib, and supporting data used by the SPA shell.
- **Primary risks:** Legacy navigation rendering inside routed pages, placeholder/demo data leaking into production views, and incomplete accessibility labeling for primary navigation.
- **Readiness:** Critical navigation, state, and data fidelity issues remain. Address the findings below before deployment.

## Issue Type Summary
| Issue Type | Count |
| --- | --- |
| Accessibility | 3 |
| Design | 1 |
| Feedback | 3 |
| Navigation | 3 |
| State/Data | 11 |

## Detailed Findings

### src/App.tsx
- **Lines 48-74:** `AppShell` now owns global navigation, but nested routes still render legacy `<Navigation>` menus, causing duplicated nav bars and conflicting focus order. Remove per-page `<Navigation>` usage and rely on the shell layout. 【F:src/App.tsx†L48-L74】

### src/pages/Index.tsx
- **Lines 205-294:** Renders the retired `<Navigation>` component inside the routed page, leading to duplicated navigation elements and conflicting keyboard traps when the shell is active. Migrate to shell slots instead. 【F:src/pages/Index.tsx†L203-L295】
- **Lines 111-132, 357-394:** Homepage metrics and reward blocks rely on static demo copy (`'6 day streak'`, `'PK Battles'`, etc.) instead of live data. Replace with real API sources or gate them behind skeleton/loading states. 【F:src/pages/Index.tsx†L111-L394】

### src/pages/IndexRefactored.tsx
- **Lines 15-23:** Accesses `localStorage` during render without guarding for server-side rendering or private browsing, which can crash hydration. Wrap storage checks in `typeof window !== 'undefined'` guards or move into `useEffect`. 【F:src/pages/IndexRefactored.tsx†L15-L23】

### src/components/HomeLayout.tsx
- **Lines 38-48:** Fixed “Go Live” FAB overlaps AppShell’s bottom navigation on mobile, creating stacked controls and occluding the safe-area inset. Use the shell’s `GoLiveEntry` hook instead of an additional floating button. 【F:src/components/HomeLayout.tsx†L22-L48】

### src/pages/Explore.tsx
- **Lines 15-198:** Entire discover experience is driven by `creatorsData` mocks and fabricated stats/toasts, so viewers never see real routing, localization, or energy metrics. Replace with API-backed queries and remove artificial `setInterval` updates. 【F:src/pages/Explore.tsx†L15-L198】

### src/pages/Connect.tsx & src/pages/Calls.tsx
- **Lines 43-118 (Connect) & 43-118 (Calls):** Both pages embed `<Navigation>` and filter against static `creators` mocks, so availability, rates, and presence never reflect production data. Lift navigation into the shell and source creators from `/api/creators` with live presence. 【F:src/pages/Connect.tsx†L43-L118】【F:src/pages/Calls.tsx†L43-L118】

### src/pages/Creators.tsx
- **Lines 64-78:** API results are immediately overwritten with hard-coded tiers, toy info, random viewer counts, and fake earnings. Map server fields directly and show skeletons/placeholders instead of fabrication. 【F:src/pages/Creators.tsx†L64-L78】
- **Lines 92-118:** Legacy `<Navigation>` call persists. Remove in favor of AppShell context navigation. 【F:src/pages/Creators.tsx†L91-L118】

### src/pages/Content.tsx
- **Lines 11-47:** Content grids are populated entirely from `data/posts` mocks, duplicating imagery and pricing. Wire the tabs to real content queries or hide locked cards until data arrives. 【F:src/pages/Content.tsx†L11-L47】【F:src/data/posts.ts†L1-L60】

### src/pages/Groups.tsx
- **Lines 15-94:** Crew listings and events are sourced from `data/groups` mocks and static copy (“PK Battle · NeonFox vs StarBlaze”). Replace with Supabase group queries and dynamic event feeds. 【F:src/pages/Groups.tsx†L15-L94】【F:src/data/groups.ts†L1-L35】

### src/pages/Live.tsx
- **Lines 2-23:** Live view resolves creators from the static list instead of fetching by slug, so deep links break once real data differs. Load creator details via API and handle missing states gracefully. 【F:src/pages/Live.tsx†L2-L23】

### src/pages/TokenShop.tsx & src/components/VibeCoinPackages.tsx
- **Lines 19-143:** Coin packages fall back to `console.log`/`console.error` when toast context is missing and hard-code `userId: 1` in purchase payloads, risking silent failures and wrong receipts. Always use a shared toast provider and pass the authenticated user ID. 【F:src/components/VibeCoinPackages.tsx†L9-L143】

### src/pages/LiveCreator.tsx
- **Lines 136-149:** Stream teardown posts to `/creators/creator_username/status`, a placeholder route that never updates real presence. Swap for the actual creator status endpoint and emit LiveKit metadata updates instead. 【F:src/pages/LiveCreator.tsx†L136-L149】

### src/components/layout/AppShell.tsx
- **Lines 123-150 & 212-254:** Primary desktop and mobile `<nav>` elements lack accessible names, so screen readers announce them as “navigation” with no context. Add `aria-label` (e.g., “Primary”) and expose menu toggle state via `aria-controls`. 【F:src/components/layout/AppShell.tsx†L123-L150】【F:src/components/layout/AppShell.tsx†L212-L254】

### src/components/Navbar.tsx
- **Lines 108-129:** Top-right balance pill is hard-coded to `💎 0/min`, diverging from the wallet store shown in AppShell and confusing users switching between views. Bind to `useWallet` and surface the same balance format. 【F:src/components/Navbar.tsx†L108-L129】

### src/components/LiveStreamCard.tsx
- **Lines 29-40:** Auto-increments viewer counts and toasts synthetic tips every 15s, creating false engagement signals. Replace with real WebSocket updates or remove the simulation. 【F:src/components/LiveStreamCard.tsx†L29-L40】

### src/components/CallSession.tsx
- **Lines 24-47:** Call controls (`Mute`, `Camera`) are static buttons; there’s no LiveKit binding or feedback on interaction. Wire them to actual media track toggles and disable until connected. 【F:src/components/CallSession.tsx†L24-L47】

### src/components/ReportButton.tsx
- **Lines 17-18:** Uses `window.prompt`, which is non-themable, inaccessible, and blocks mobile keyboards. Replace with a modal form or `AlertDialog` using labeled inputs. 【F:src/components/ReportButton.tsx†L17-L24】

### src/components/Navigation.tsx & dependent pages
- **Lines 7-12:** Component returns `null` but pages still import it, increasing bundle size and confusion. Remove legacy imports and delete the placeholder. 【F:src/components/Navigation.tsx†L7-L12】

## Remaining Risks
- Multiple views rely on `/src/data/*` mocks; if API responses differ, UX will desync.
- LiveKit producer/consumer flows are partially wired, risking broken media controls until bindings land.
- Toast feedback is inconsistent between the Sonner provider and ad-hoc console fallbacks.

## Recommendation
Resolve the issues above, re-run accessibility and integration tests (`npm run lint`, `npm run typecheck`, LiveKit QA), and replace placeholder data with API-driven sources before promoting to production.
