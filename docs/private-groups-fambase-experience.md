# Private Groups: Fambase-Style Experience Specification

## Feature & UX Spec

### Group Feed & Discovery
- Personalized feed combining active, pending and suggested groups.
- Group cards show banner/avatar, name, privacy badge (🔒/public), live status and member count.
- Action button varies: **Preview** or **Join**; invite-only cards include invite expiry and remaining spots.
- Large **Create Group** call‑to‑action persists at bottom/top for quick access.

### Chat & Announcements
- Announcements displayed as pinned posts at top of chat timeline rather than static banners.
- Real‑time chat with text, image, video, voice notes, emojis, gifs, polls and pinning.
- Support @mentions with notifications, emoji reactions and threaded replies.

### Ownership & Moderator Tools
- Roles: owner, admin, mod, VIP, regular member.
- Capabilities: pin/unpin posts, remove members, manage roles, moderate messages.
- Analytics view showing activity graphs, top contributors, recent joiners and lurkers.
- Member profile links allow DM or viewing public posts.

### Rewards, Status & Perks
- Visible badges on avatars (OG, Top Fan, Streak, Contributor, VIP).
- Group levels unlock perks such as exclusive live events or drops.
- Leaderboards for “Member of the Week/Month” and progress meters for group milestones.
- Automated welcome and milestone messages (e.g., hitting member count milestones).

### Events, Invites & Growth
- Schedule live streams, drops and contests with in‑group alerts.
- Polls, AMAs and suggestion boxes for interactive content.
- Temporary boost events like "Double Rewards Hour" or "Q&A Night".
- Invite links expire after 24 hours and show status (accepted, pending, expiring) with resend/invalidate options.
- Share invites via copy, QR code or direct DM; closed groups support join requests.

### Notifications
- Smart notifications highlight "live now", upcoming events and group milestones.
- @mentions and thread replies trigger targeted notifications.
- Users can manage notification preferences per group.

### Safety & Onboarding
- Display group rules and quick "How this group works" guide for newcomers.
- Reporting and blocking tools available in chat and member profiles.
- Easy access to remove or mute disruptive members.

## Component Checklist (React/Mobile)
- **Group Feed Screen**: feed container, group card component, create group button.
- **Group Card**: banner/avatar, name, privacy badge, live indicator, member count, action button.
- **Group Creation Modal**: form fields, privacy toggle, invite generation.
- **Chat Screen**: header with group info, message list, pinned announcement area, persistent input bar, reactions and thread UI.
- **Message Composer**: text input, media attachments, emoji/gif picker, poll/AMA creation, voice note record, send button.
- **Member List & Roles**: list component with role badges, management actions.
- **Analytics Dashboard**: activity charts, top contributors list, member growth indicators.
- **Badges & Leaderboard**: badge component, progress meters, member of the week/month carousel.
- **Events & Invites Modal**: schedule form, invite status list, share options (copy, QR, DM).
- **Notification Settings**: per‑group preferences, mute controls.
- **Safety Tools**: report/block buttons, onboarding guide component.

## UX & Engagement Notes
- Encourage posts with prompts and timely milestone messages.
- Highlight active or trending groups in discovery to spark FOMO.
- Badges and leaderboards provide social proof and motivate participation.
- Smart reminders for events and expiring invites drive return visits.
- Give newcomers a guided tour and suggest first actions to reduce churn.
- Provide easy ways to share the group externally to fuel viral growth.
