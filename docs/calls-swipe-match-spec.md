# Calls: Swipe-to-Match UX Specification

## Overview

The Calls section transforms into a swipable, match-driven experience that combines creator discovery with instant video/voice connections. Inspired by iVibes and Who, users swipe through dynamic profile cards, match in real time, and jump into social calls with token-based billing.

## 1. Discovery Feed – Swipe‑to‑Call

- **Swipeable Card Stack** showing a large live preview or avatar, nickname, verification badges, live/online status, quick "About Me" tags, and the call rate in tokens per minute.
- **Actions on the card**: tap to favorite/follow; swipe right to request a call; swipe left to skip. Mutual right swipes surface an "It's a match!" modal.
- **Bottom controls**: primary Video and Voice call buttons plus a **Random Connect** toggle for quick matchmaking.

## 2. Interactive Matching & Calls

- **Random Call / One‑Tap Connect** pairs the user with any available creator or fan.
- Animated countdown modal and matching feedback while the system finds a partner.
- Incoming call notifications display accept/decline and profile preview for available creators.
- Online status indicators use colored badges or rippling glow animations to highlight availability.

## 3. In‑Call Experience Upgrades

- Overlay with a real‑time token meter showing rate and elapsed tokens.
- Gifting and emoji reactions, heart/flame effects, and an always‑visible **Tip** button.
- Optional recording or bookmarking of favorite moments when permitted.
- Swipe up/down gestures to end or disconnect from the call.
- Persistent **Toy Sync Dashboard** widget for controlling interactive hardware intensity and trigger effects.

## 4. Community Features

- Leaderboards for most active callers, VIP members, and newly joined creators.
- Call history view, favorites list, and call streak badges to drive repeat engagement.

## 5. Onboarding & Safety

- First‑time popover tutorial titled **"How Calling Works"**.
- Reporting/blocking tools and a safety disclaimer before the initial call; support for photo or voice verification screening.
- Age, gender, and interest filters applied to Random Call and smart matchmaking queues.

## 6. UI & Component Guidelines (React)

- Implement the card stack with a responsive `Swiper`/`Embla` component and Tailwind for styling.
- Listen for real‑time presence updates via WebSocket or LiveKit; animate online badges and match modals with CSS transitions.
- Ensure accessible keyboard navigation and focus states for all interactive elements.

## 7. Performance & Mobile

- Mobile‑first layout with single‑tap access to the next card or call action.
- Lazy‑load avatars and live thumbnails; prefetch the next card for smooth swiping.
- Virtualize the card list to minimize DOM nodes and debounce presence updates for efficiency.

## 8. User Journey Example

1. Open **Calls** to view the swipeable card stack.
2. Swipe profiles or tap **Random Call**.
3. On mutual right swipe, show **It's a match!** then enter the call.
4. During the call, interact via reactions, tipping, Toy Sync, and monitor token meter.
5. Swipe up/down to end, rate or favorite the caller, then return to the next card.

## 9. Technical Recommendations

- Card stack: `embla-carousel-react` or `Swiper.js` with custom swipe gestures.
- Matching & presence: WebSockets backed by LiveKit or a custom match queue service.
- State management: React Query for server state and optimistic updates.
- Random Call: server maintains a queue and pairs users; client shows animated countdown until the LiveKit room connects.
