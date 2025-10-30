# Feelynx Brand System

## Wordmark v2 Migration Notes

- The neon wordmark lives in `src/components/brand/IvibesLogo.tsx`. Prefer the component anywhere the logo or mascot image was used.
- The v2 wordmark is gated by the `BRAND.v2Wordmark` feature flag. Set `VITE_BRAND_V2_WORDMARK=false` (or `NEXT_PUBLIC_BRAND_V2_WORDMARK=false`) to fall back to text-only renders if needed.
- CSS variables for Feelynx colors are defined in `src/styles.css` and exposed to Tailwind as `feelynx.pink`, `feelynx.cyan`, `feelynx.ink`, and `feelynx.outline`.
- The base tile source lives at `/public/brand/feelynx-icon.svg`. Generate release-ready favicons and splash assets with `pnpm run generate:brand-icons`. Outputs are written to `public/brand/generated/` (ignored in git) with a companion `manifest.icons.json` snippet for updating platform manifests.

## Usage Guidelines

- Minimum display height is 24px for navigation and 40px for hero placements; enable the glow only on dark backgrounds.
- Use the tagline option sparingly for onboarding, authentication, or empty states.
- The compact tile (`feelynx-icon.svg`) is the source of truth for favicons, app icons, and share thumbnails.

## Don’ts

- Do not reintroduce the fox/devil mascots or legacy PNG logos.
- Avoid stretching, skewing, or recoloring the wordmark outside the defined gradient (#E8338B → #5CC8FF) and outline (#1B1230).
- Do not stack other graphics behind the wordmark glow; keep the background flat or lightly textured.
