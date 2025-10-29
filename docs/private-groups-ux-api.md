# Private Groups: Upgraded UX & API Specification

## Key Features

### Must-Haves

1. **Seamless Group Access**
   - One-tap join via link, QR code, or invite code (24‑hour expiry with auto refresh).
   - Unified entry point for creating or joining groups, showing member count and privacy level.
2. **Rich Group Communication**
   - Persistent chat threads with typing indicators and read receipts.
   - Inline media: photos, videos, voice notes, polls/RSVPs, rich previews of posts or live streams.
   - Group announcements with embedded media and countdown timers.
3. **Role-Based Permissions**
   - Roles: owner, admin, moderator, VIP, member.
   - Configurable permissions for posting, pinning, moderation, and invite generation.
4. **Content Highlighting**
   - Pinned/highlighted posts for live show promotions or exclusive drops.
   - Countdown and auto notifications for scheduled live shows or releases.
5. **Exclusive Incentives**
   - Promo codes, exclusive drops, XP/badge system for engagement.
   - Analytics dashboard: active members, engagement rates, content popularity.
6. **Safety & Controls**
   - Reporting, block/mute, parental or age verification.
   - Moderation tools: delete message, remove member, shadow ban, revoke invites.

### Enhancements Over Family

- Persistent threaded chat rather than announcement-only feed.
- Rich media support including voice, polls/AMA, rewards.
- Advanced invite management with tracking and QR codes.
- Gamified XP & badges, VIP perks, and analytics for creators.
- Flexible notification controls (silent, @mentions, DND schedules).

## User Flows

### Join a Group

1. Open **Private Groups** → **Join Group**.
2. Enter invite link/code or scan QR to preview group details.
3. Accept rules and optional nickname, then join chat with auto welcome message.
4. Invite token auto-expires after 24 hours unless refreshed.

### Create a Group

1. Tap **Create Group**.
2. Set name, cover image, description, privacy, and role permissions.
3. System generates invite link/QR; creator lands in chat with onboarding tips.

### Share/Invite

1. **Invite** button displays link, QR, and short code.
2. Track invite status: pending, accepted, expiring soon.
3. Share via copy, DM, social, or in-person QR.
4. Regenerate expired invites with one tap.

### Post/Chat

1. Sticky composer for text, emoji, attachments, camera, voice, poll/RSVP, tip.
2. Messages are chronological; pinned items float at top.
3. Reactions, tipping, and threaded replies supported.
4. Media uploads show progress indicators; tap to open full viewer.

### Moderate

1. Long press a message/member → delete, pin/unpin, warn, mute, ban, promote/demote.
2. **Analytics** panel: member growth, active users, top posts, engagement heatmap.
3. Reporting flow: user reports → moderators queue → actions logged.

## UI/UX Sketch

- **Group List**: Cards with cover photo, member count, last activity; floating "+ New Group".
- **Group Chat Screen**: Header with group info, member avatars, menu for members/invites/analytics.
  Scrollable chat feed with pinned posts at top. Sticky composer with emoji, camera, media, poll, tip.
  Swipe right to reply; long press for reactions, pin, delete.
- **Invite Management**: Modal with tabs for Active, Pending, Expired invites.
- **Analytics Dashboard**: Tiles for active members, posts/day, top contributors, export option.
- **Gamification & Rewards**: Badges beside usernames, XP progress bar, "Top Fans" carousel.

## API / Backend Checklist

### Groups

- `POST /groups` – create group.
- `GET /groups` – list user’s groups.
- `GET /groups/{id}` – details, member count, pinned content, latest message.
- `PATCH /groups/{id}` – update settings or roles.
- `DELETE /groups/{id}` – delete/archive.

### Invites

- `POST /groups/{id}/invites` – generate invite (link, QR, code, expiry).
- `GET /groups/{id}/invites` – list invites with status.
- `PATCH /invites/{inviteId}` – extend, revoke, or resend.
- `POST /invites/{inviteId}/accept` – join group with validation.

### Messaging & Media

- `POST /groups/{id}/messages` – send message (text, media, polls, RSVPs).
- `GET /groups/{id}/messages` – paginate chat history; support threads and pinned filter.
- `POST /messages/{id}/reactions` – emoji reactions.
- `POST /groups/{id}/media` – upload media; CDN integration.
- WebSocket `/ws/groups/{id}` – real-time messages, typing indicators, presence.

### Roles & Members

- `GET /groups/{id}/members` – list members with roles, XP, last active.
- `PATCH /groups/{id}/members/{userId}` – promote/demote, mute, ban.
- `DELETE /groups/{id}/members/{userId}` – remove from group.
- `POST /groups/{id}/rewards` – issue badges, promo codes, or XP.

### Moderation & Safety

- `POST /groups/{id}/reports` – submit report.
- `POST /members/{userId}/block` and `/mute`.
- `GET /groups/{id}/moderation-log` – audit trail.

### Analytics

- `GET /groups/{id}/analytics` – metrics: active members, messages per period, top posts, engagement.
- `GET /groups/{id}/leaderboard` – top fans by XP or contributions.
