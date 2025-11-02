# Feelynx Design System (Code-Driven)

This project uses a code-driven design system built on Tailwind CSS + shadcn/ui primitives.

- Tokens: `tailwind.config.ts` and `src/styles.css` define core color roles, radii, spacing, shadows.
- Components: `src/components/ui/*` are primitive building blocks (buttons, inputs, cards, dialogs).
- Composites: `src/components/*` and `src/components/live/*` compose features and layouts.

## Tokens

- Colors: background, card, primary, secondary, muted, destructive
- Typography: Tailwind defaults with utility classes for weight/size
- Spacing: Tailwind scale with container-based layouts
- Radii: applied via rounded utilities

## Components (primitives)

- Buttons: `src/components/ui/button.tsx`
- Inputs: `src/components/ui/input.tsx`
- Cards: `src/components/ui/card.tsx`
- Dialogs: `src/components/ui/dialog.tsx`
- Tabs: `src/components/ui/tabs.tsx`
- Badges: `src/components/ui/badge.tsx`

## Feature Composition

- Live UI: `src/components/live/*` (video panel, headers, chat, controls)
- Navigation: `src/components/Navigation.tsx`
- Modals / Forms: `src/components/*` and `src/components/forms/*`

## Preview

- Visit `/styleguide` in the app to see rendered tokens and common components.

## Conventions

- PascalCase filenames for components (see `docs/naming-conventions.md`)
- Co-locate feature components in `src/features` or `src/components/live`
