# Architecture Overview

This document provides an overview of how the existing backend can grow to support payments, messaging and group rooms. It also outlines important security considerations.

## Suggested Schema Extensions

### Payments
- Extend the current `payments` table with columns for:
  - `status` (e.g. pending, completed, failed)
  - `currency` (ISO currency code)
  - `method` (credit card, vibecoin, etc.)
- Create a `payment_methods` table to store tokens/identifiers for each user’s saved payment options.

### Messaging
- Introduce a `messages` table with fields:
  - `id` – primary key
  - `sender_id` – references `users`
  - `receiver_id` – references `users` (nullable for group messages)
  - `group_id` – references a new `groups` table when messaging within a room
  - `content` – text or JSON payload
  - `sent_at` – timestamp
- Consider a `groups` table to hold group room metadata and membership relationships.

## Integrating Group Room Logic
- LiveKit is already used for token issuance in `server/routes/livekit.ts`.
- Group room management could live under a new route (e.g. `/rooms`) which:
  - Creates and deletes rooms using LiveKit API
  - Stores room membership in the `groups` table
  - Generates access tokens for room members

## Security Considerations
- **Authentication**: ensure password hashing and token-based sessions for all routes under `/auth`.
- **Rate Limiting**: apply middleware to throttle authentication attempts and any payment or messaging endpoints.
- **Database Access**: use parameterized queries or Prisma ORM to avoid SQL injection.
- Validate all incoming request data using a library such as `zod` or `joi`.
- Protect WebSocket endpoints (LiveKit) by verifying tokens and limiting connection rate.

## Manual Reviews
Before any deployment, perform a manual security review. Pay particular attention to validating request data and protecting WebSocket endpoints to prevent abuse.
