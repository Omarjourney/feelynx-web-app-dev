# Server Route Map

This document outlines every Express route handler defined under the `server/` directory, including the expected request payloads, parameters, and query strings enforced by the shared validation layer in `server/utils/validation.ts`.

## App-level routes (`server/index.ts`)

| Method | Path                         | Description                                                                   | Request Body                                                                           | Params / Query                                       |
| ------ | ---------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| POST   | `/creators/:username/status` | Update and broadcast a creator's live status.                                 | `{ isLive: boolean }` (`true`/`false`)                                                 | `:username` safe identifier (`[A-Za-z0-9._-]{1,64}`) |
| POST   | `/rooms/:room/join`          | Register a participant as host or viewer for a room and broadcast the change. | `{ role: 'host' \| 'viewer', identity: string }` (identity limited to safe identifier) | `:room` non-empty string up to 120 chars             |
| POST   | `/rooms/:room/leave`         | Remove a participant from a room and broadcast the update.                    | `{ role: 'host' \| 'viewer', identity: string }`                                       | `:room` non-empty string up to 120 chars             |

## Authentication (`/auth`)

| Method | Path             | Description                              | Request Body                                                                   | Params / Query                                     |
| ------ | ---------------- | ---------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------- |
| POST   | `/auth/register` | Create a new user account.               | `{ email: string (email format, ≤320 chars), password: string (8-128 chars) }` | —                                                  |
| POST   | `/auth/login`    | Authenticate an existing user.           | `{ email: string (email format), password: string (8-128 chars) }`             | —                                                  |
| GET    | `/auth/me`       | Return the authenticated user's profile. | —                                                                              | Requires `Authorization` header with Bearer token. |

## Users (`/users`)

| Method | Path         | Description                       | Request Body                                                                                                             | Params / Query         |
| ------ | ------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| GET    | `/users/:id` | Placeholder user fetch.           | —                                                                                                                        | `:id` positive integer |
| PUT    | `/users/:id` | Placeholder user update response. | Any combination of `{ email?: string email, displayName?: string ≤80, bio?: string ≤500 }` (at least one field required) | `:id` positive integer |

## Posts (`/posts`)

| Method | Path     | Description                                          | Request Body                                                      | Params / Query                                        |
| ------ | -------- | ---------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------- |
| GET    | `/posts` | Placeholder post listing with optional filters echo. | —                                                                 | `creatorId` safe identifier; `limit` 1-100; `page` ≥1 |
| POST   | `/posts` | Placeholder create post response.                    | `{ title: string (1-150 chars), content: string (1-5000 chars) }` | —                                                     |

## Payments (`/payments`)

| Method | Path                        | Description                                                 | Request Body                                                                                                           | Params / Query                     |
| ------ | --------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| POST   | `/payments/create-intent`   | Create a Stripe PaymentIntent and record purchase.          | `{ amount: number >0, coins: integer >0, currency?: 3-letter ISO code (defaults to `usd`), userId: positive integer }` | —                                  |
| POST   | `/payments/success`         | Validate a successful payment and attach receipt URL.       | `{ paymentIntentId: string }`                                                                                          | —                                  |
| GET    | `/payments/balance/:userId` | Aggregate total purchased coins for a user.                 | —                                                                                                                      | `:userId` positive integer         |
| POST   | `/payments/webhook`         | Stripe webhook handler (expects full Stripe event payload). | Stripe event object (validated for `type` string)                                                                      | Requires `Stripe-Signature` header |

## LiveKit (`/livekit`)

| Method | Path                   | Description                                  | Request Body                                                                            | Params / Query      |
| ------ | ---------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------- |
| POST   | `/livekit/token`       | Issue an access token for a room.            | `{ room: string ≤120 chars, identity: string ≤120 chars }`                              | —                   |
| POST   | `/livekit/rooms`       | Create a LiveKit room via RoomService.       | `{ name: string ≤120, emptyTimeout?: integer ≥0, maxParticipants?: integer 1-1024 }`    | —                   |
| GET    | `/livekit/rooms`       | List existing LiveKit rooms.                 | —                                                                                       | —                   |
| DELETE | `/livekit/rooms/:room` | Delete a LiveKit room.                       | —                                                                                       | `:room` string ≤120 |
| POST   | `/livekit/webhook`     | Handle LiveKit webhook events for analytics. | `{ event: string, room?: { name?: string }, participant?: { identity?: string }, ... }` | —                   |

## Creators (`/creators`)

| Method | Path        | Description                              | Request Body | Params / Query |
| ------ | ----------- | ---------------------------------------- | ------------ | -------------- |
| GET    | `/creators` | List creators with minimal profile data. | —            | —              |

## Stream (`/stream`)

| Method | Path                 | Description                          | Request Body              | Params / Query |
| ------ | -------------------- | ------------------------------------ | ------------------------- | -------------- |
| POST   | `/stream/rtmp/start` | Return mock RTMP connection details. | `{}` (no payload allowed) | —              |
| POST   | `/stream/rtmp/stop`  | Mock RTMP stop endpoint.             | `{}` (no payload allowed) | —              |

## Gifts (`/gifts`)

| Method | Path                              | Description                              | Request Body                                                         | Params / Query               |
| ------ | --------------------------------- | ---------------------------------------- | -------------------------------------------------------------------- | ---------------------------- |
| GET    | `/gifts/catalog`                  | Retrieve available gifts.                | —                                                                    | —                            |
| POST   | `/gifts/balance/:userId/purchase` | Add tokens to a user's balance.          | `{ amount: integer >0 }`                                             | `:userId` safe identifier    |
| POST   | `/gifts/send`                     | Transfer a gift between users.           | `{ from: safe identifier, to: safe identifier, giftId: integer >0 }` | —                            |
| GET    | `/gifts/leaderboard/:creatorId`   | Summarize total gifts sent to a creator. | —                                                                    | `:creatorId` safe identifier |

## Rooms (`/rooms`)

| Method | Path                        | Description                                    | Request Body | Params / Query      |
| ------ | --------------------------- | ---------------------------------------------- | ------------ | ------------------- |
| GET    | `/rooms/:room/participants` | Return live host/viewer identities for a room. | —            | `:room` string ≤120 |

## Moderation (`/moderation`)

| Method | Path                  | Description                                             | Request Body                                                                         | Params / Query |
| ------ | --------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------- |
| POST   | `/moderation/report`  | Submit a moderation report and invoke optional AI scan. | `{ reportedId: positive integer, type: string ≤50, reason: string 10-1000 chars }`   | —              |
| GET    | `/moderation/reports` | List pending reports.                                   | —                                                                                    | —              |
| POST   | `/moderation/actions` | Record a moderation action and resolve the report.      | `{ reportId: positive integer, action: string ≤50, moderatorId?: positive integer }` | —              |

## Analytics (`/analytics`)

| Method | Path                                   | Description                               | Request Body | Params / Query               |
| ------ | -------------------------------------- | ----------------------------------------- | ------------ | ---------------------------- |
| GET    | `/analytics/streams/:streamId`         | Aggregate metrics for a specific stream.  | —            | `:streamId` safe identifier  |
| GET    | `/analytics/creators/:creatorId/daily` | Aggregate creator metrics grouped by day. | —            | `:creatorId` safe identifier |

## Games (`/games`)

| Method | Path                    | Description                                             | Request Body                                          | Params / Query             |
| ------ | ----------------------- | ------------------------------------------------------- | ----------------------------------------------------- | -------------------------- |
| POST   | `/games/start`          | Create a game session and broadcast start data.         | `{ gameId: positive integer, room: string ≤120 }`     | —                          |
| POST   | `/games/:id/end`        | End a session, reward the winner, broadcast completion. | `{ winnerId?: positive integer, reward?: number ≥0 }` | `:id` positive integer     |
| GET    | `/games/wallet/:userId` | Return in-memory game wallet balance.                   | —                                                     | `:userId` positive integer |

## Match (`/match`)

| Method | Path           | Description                                             | Request Body                                                               | Params / Query                  |
| ------ | -------------- | ------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------- |
| GET    | `/match/next`  | Fetch the next available creator for swiping.           | —                                                                          | `userId` positive integer query |
| POST   | `/match/swipe` | Record a swipe decision and create a match when mutual. | `{ userId: positive integer, targetId: positive integer, liked: boolean }` | —                               |

## Payouts (`/payouts`)

| Method | Path               | Description                                       | Request Body                                         | Params / Query                     |
| ------ | ------------------ | ------------------------------------------------- | ---------------------------------------------------- | ---------------------------------- |
| POST   | `/payouts/onboard` | Initiate Stripe Express onboarding for a creator. | `{ creatorId: positive integer }`                    | —                                  |
| POST   | `/payouts/request` | Queue a payout for later processing.              | `{ creatorId: positive integer, amount: number >0 }` | —                                  |
| POST   | `/payouts/webhook` | Stripe account status webhook.                    | Stripe event payload with `type` string.             | Requires `Stripe-Signature` header |

## PK Battles (`/pkBattles`)

| Method | Path                           | Description                                          | Request Body                                                                                                | Params / Query               |
| ------ | ------------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------- |
| POST   | `/pkBattles/`                  | Create a PK battle between two creators.             | `{ creatorAId: positive int, creatorBId: positive int, startAt: ISO date string, endAt?: ISO date string }` | —                            |
| POST   | `/pkBattles/:battleId/scores`  | Update live scores and stream to subscribers.        | `{ scoreA: integer ≥0, scoreB: integer ≥0 }`                                                                | `:battleId` positive integer |
| GET    | `/pkBattles/:battleId/stream`  | Server-sent events stream of PK battle scores.       | —                                                                                                           | `:battleId` positive integer |
| POST   | `/pkBattles/:battleId/connect` | Establish temporary LiveKit connection for a battle. | `{ url: string URL, token: string ≤500 }`                                                                   | `:battleId` positive integer |

## Privacy (`/privacy`)

| Method | Path               | Description                                                     | Request Body                                                                             | Params / Query             |
| ------ | ------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------- |
| GET    | `/privacy/:userId` | Fetch privacy settings for a user.                              | —                                                                                        | `:userId` positive integer |
| POST   | `/privacy/:userId` | Upsert privacy preferences and schedule data retention cleanup. | `{ profileVisibility: string ≤32, allowDMs: boolean, dataRetentionDays: integer 1-365 }` | `:userId` positive integer |

## Stories (`/stories`)

| Method | Path           | Description                         | Request Body                                                                                                            | Params / Query        |
| ------ | -------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------- |
| GET    | `/stories`     | List stories ordered by expiration. | —                                                                                                                       | —                     |
| POST   | `/stories`     | Create a new story.                 | `{ creatorId: positive integer, mediaUrl: URL, expiresAt: ISO date, visibility: string ≤32, tierId?: safe identifier }` | —                     |
| DELETE | `/stories/:id` | Delete a story.                     | —                                                                                                                       | `:id` safe identifier |

## Subscriptions (`/subscriptions`)

| Method | Path                      | Description                                  | Request Body                                                                                                  | Params / Query                     |
| ------ | ------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| POST   | `/subscriptions/checkout` | Launch a Stripe Checkout session for a tier. | `{ priceId: string ≤120, successUrl: URL, cancelUrl: URL, userId: safe identifier, tierId: safe identifier }` | —                                  |
| POST   | `/subscriptions/webhook`  | Handle Stripe subscription webhooks.         | Stripe event payload with `type` string                                                                       | Requires `Stripe-Signature` header |
| POST   | `/subscriptions/cancel`   | Mark a subscription as canceled.             | `{ tierId: safe identifier, userId?: safe identifier }`                                                       | —                                  |

## Direct Messages (`/dm`)

| Method | Path                       | Description                              | Request Body                                                                                                   | Params / Query        |
| ------ | -------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------- |
| POST   | `/dm/threads`              | Create a DM thread with a recipient.     | `{ recipientId: safe identifier }`                                                                             | —                     |
| GET    | `/dm/threads`              | List threads for the authenticated user. | —                                                                                                              | —                     |
| GET    | `/dm/threads/:id/messages` | List messages within a thread.           | —                                                                                                              | `:id` safe identifier |
| POST   | `/dm/threads/:id/messages` | Append an encrypted message to a thread. | `{ cipher_text: string ≤10000, nonce: string ≤500, recipientId: safe identifier, burnAfterReading?: boolean }` | `:id` safe identifier |
| POST   | `/dm/messages/:id/read`    | Mark or burn a message after viewing.    | —                                                                                                              | `:id` safe identifier |

## DMCA (`/dmca`)

| Method | Path                | Description                                    | Request Body                                                                 | Params / Query         |
| ------ | ------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| POST   | `/dmca`             | Submit a DMCA takedown notice.                 | `{ reporterName: string ≤120, reporterEmail: email ≤320, contentLink: URL }` | —                      |
| GET    | `/dmca`             | List all DMCA notices.                         | —                                                                            | —                      |
| POST   | `/dmca/:id/resolve` | Resolve a DMCA notice and notify the reporter. | `{ status: string ≤50, resolution: string 5-2000 chars }`                    | `:id` positive integer |
