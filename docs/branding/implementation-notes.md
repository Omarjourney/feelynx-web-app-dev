# Feelynx Branding Implementation Notes

- Source of truth icon: `public/brand/feelynx-icon.svg`.
- Generated PWA assets live under `public/brand/generated/` (git-ignored by default except demo outputs when needed).
- Exported app icons placed for direct usage:
  - `public/icons/feelynx-icon-512.png`
  - `public/icons/feelynx-icon-1024.png`

## Manifest and Meta

- `public/manifest.json` updated to reference 512/1024 PNGs with `any` and `maskable` purposes.
- `index.html` uses PNG for `og:image` and `twitter:image`.
- Favicons and Apple icon wired to generated outputs:
  - `/brand/generated/favicon-196.png`
  - `/brand/generated/apple-icon-180.png`

## Navbar Usage

- Navbar now renders `<FeelynxLogo size={96} glow={false} />` instead of a static wordmark image.

## Glow Utility

- Added `.neon-glow` and `.neon-glow-hover` utilities in `src/styles.css` for brand accents.

## Regenerating Icons

- Run `pnpm run generate:brand-icons`.
- This regenerates splash screens and helper PNGs under `public/brand/generated/` and writes a suggested `manifest.icons.json`.
