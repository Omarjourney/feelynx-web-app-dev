# Feelynx Facelift Enhancement Layer

This guide documents the visual polish applied across modules while preserving brand colors, layout, and functionality.

## Base theme (Tailwind extend)
Added non-destructive tokens in `tailwind.config.ts`:
- borderRadius: `card: 16px`, `button: 12px`
- boxShadow: `base`, `elevated` (kept existing `glow`, `premium`)
- backdropBlur: `xs`, `sm`, `md` (kept existing `xl`, `2xl`)
- transitions: `ease-soft`, default duration 250ms
- spacing: `section-sm|md|lg`

## Global utility patterns
- Cards: `rounded-card shadow-base hover:shadow-elevated transition-shadow duration-300 bg-neutral-900/60 backdrop-blur-md`
- Buttons: `rounded-button bg-gradient-to-r from-primary to-secondary text-white shadow-glow hover:scale-105 motion-safe:transition-transform motion-safe:duration-200`
- Inputs: `rounded-button bg-neutral-900/70 border border-white/10 focus:ring-2 focus:ring-primary focus:ring-offset-2 placeholder-gray-500`

## Live Stream enhancements
- Video: `aspect-video md:h-[75vh] rounded-card` inside a card with glass effect and subtle shadows.
- Chat: card uses translucent overlay `bg-black/45 backdrop-blur-md` without changing behavior.
- Controls: subtle hover scale and glow on buttons (motion-safe).
- Reactions: existing float animation preserved; consider glowing emoji colors to enhance feedback.

## Typography & spacing
- Recommended utility scale:
  - H1: `text-4xl sm:text-5xl font-bold`
  - H2: `text-2xl sm:text-3xl font-semibold`
  - Body: `text-base sm:text-lg text-gray-400 leading-relaxed`
- Sections: `py-section-md sm:py-section-lg`
- Rhythm: 8/16/24/32px multiples for vertical spacing (use `space-y-*`, `gap-*`).

## Navigation & interactions
- Centered icons with mild hover scale: `motion-safe:transition-transform motion-safe:duration-200 hover:scale-105`
- Active glow: `drop-shadow-[0_0_6px_rgba(147,51,234,0.5)]`

## Drop-in overlays (class lists)
- Overlay chat container: `bg-black/45 backdrop-blur-md rounded-card shadow-base`
- Slide toggle (example): `transition-transform duration-300 ease-soft translate-x-full data-[open=true]:translate-x-0`
- Reaction bar buttons: `rounded-button shadow-glow hover:scale-105 motion-safe:transition-transform motion-safe:duration-200`

## Notes
- All changes are additive to preserve colors and layout.
- Use new utilities in modules progressively; no breaking changes required.
