import { z, ZodError } from 'zod';
const DANGEROUS_CHARS = /[<>`"'{}\\]/g;
export const sanitizeString = (value) => value.replace(DANGEROUS_CHARS, '').trim();
export const sanitizePayload = (input) => {
  if (typeof input === 'string') {
    return sanitizeString(input);
  }
  if (Array.isArray(input)) {
    return input.map((item) => sanitizePayload(item));
  }
  if (input instanceof Date) {
    return new Date(input);
  }
  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, sanitizePayload(value)]),
    );
  }
  return input;
};
const applySchema = (schema, payload) => {
  if (!schema) {
    return undefined;
  }
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw result.error;
  }
  return sanitizePayload(result.data);
};
export const withValidation = (schemas) => (req, res, next) => {
  try {
    ['body', 'params', 'query'].forEach((key) => {
      if (schemas[key]) {
        const value = applySchema(schemas[key], req[key]);
        if (value !== undefined) {
          req[key] = value;
        }
      }
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'ValidationError',
        details: error.errors.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        })),
      });
    }
    next(error);
  }
};
const numericId = z.coerce.number().int().positive();
const optionalNumericId = z.coerce.number().int().positive().optional();
const safeIdentifier = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9._-]+$/);
const nonEmptyString = z.string().min(1).max(255);
const booleanSchema = z.coerce.boolean();
const urlString = z.string().url();
const isoDateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Invalid date',
});
const emptyObject = z.object({}).strict();
// Auth
const authRegisterBody = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
});
const authLoginBody = authRegisterBody;
export const authSchemas = {
  register: { body: authRegisterBody },
  login: { body: authLoginBody },
};
// Users
const userIdParams = z.object({ id: numericId });
const userUpdateBody = z
  .object({
    email: z.string().email().max(320).optional(),
    displayName: nonEmptyString.max(80).optional(),
    bio: z.string().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
export const userSchemas = {
  getById: { params: userIdParams },
  update: { params: userIdParams, body: userUpdateBody },
};
// Posts
const postsListQuery = z.object({
  creatorId: safeIdentifier.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
});
const postCreateBody = z.object({
  title: nonEmptyString.max(150),
  content: z.string().min(1).max(5000),
});
export const postSchemas = {
  list: { query: postsListQuery },
  create: { body: postCreateBody },
};
// Payments
const paymentIntentBody = z.object({
  amount: z.coerce.number().gt(0),
  coins: z.coerce.number().int().positive(),
  currency: z
    .string()
    .length(3)
    .regex(/^[A-Za-z]{3}$/)
    .optional()
    .default('usd'),
  userId: numericId,
});
const paymentSuccessBody = z.object({
  paymentIntentId: nonEmptyString,
});
const paymentBalanceParams = z.object({ userId: numericId });
export const paymentSchemas = {
  createIntent: { body: paymentIntentBody },
  success: { body: paymentSuccessBody },
  balance: { params: paymentBalanceParams },
};
// LiveKit
const livekitTokenBody = z.object({
  room: nonEmptyString.max(120),
  identity: nonEmptyString.max(120),
});
const livekitRoomCreateBody = z.object({
  name: nonEmptyString.max(120),
  emptyTimeout: z.coerce
    .number()
    .int()
    .min(0)
    .max(24 * 60 * 60)
    .optional(),
  maxParticipants: z.coerce.number().int().min(1).max(1024).optional(),
});
const livekitRoomParams = z.object({ room: nonEmptyString.max(120) });
const livekitWebhookBody = z
  .object({
    event: nonEmptyString.max(120),
    room: z.object({ name: nonEmptyString.max(120).optional() }).optional(),
    participant: z.object({ identity: nonEmptyString.max(120).optional() }).optional(),
  })
  .passthrough();
export const livekitSchemas = {
  token: { body: livekitTokenBody },
  createRoom: { body: livekitRoomCreateBody },
  deleteRoom: { params: livekitRoomParams },
  webhook: { body: livekitWebhookBody },
};
// Gifts
const giftPurchaseParams = z.object({ userId: safeIdentifier });
const giftPurchaseBody = z.object({ amount: z.coerce.number().int().positive() });
const giftSendBody = z.object({
  from: safeIdentifier,
  to: safeIdentifier,
  giftId: z.coerce.number().int().positive(),
});
const giftLeaderboardParams = z.object({ creatorId: safeIdentifier });
export const giftSchemas = {
  catalog: {},
  purchase: { params: giftPurchaseParams, body: giftPurchaseBody },
  send: { body: giftSendBody },
  leaderboard: { params: giftLeaderboardParams },
};
// Rooms
const roomParams = z.object({ room: nonEmptyString.max(120) });
export const roomSchemas = {
  participants: { params: roomParams },
};
// Stream
export const streamSchemas = {
  start: { body: emptyObject },
  stop: { body: emptyObject },
};
// Moderation
const moderationReportBody = z.object({
  reportedId: numericId,
  type: nonEmptyString.max(50),
  reason: z.string().min(10).max(1000),
});
const moderationActionBody = z.object({
  reportId: numericId,
  action: nonEmptyString.max(50),
  moderatorId: optionalNumericId,
});
export const moderationSchemas = {
  report: { body: moderationReportBody },
  actions: { body: moderationActionBody },
};
// Analytics
const analyticsStreamParams = z.object({ streamId: safeIdentifier });
const analyticsCreatorParams = z.object({ creatorId: safeIdentifier });
export const analyticsSchemas = {
  stream: { params: analyticsStreamParams },
  creatorDaily: { params: analyticsCreatorParams },
};
// Games
const gameStartBody = z.object({
  gameId: numericId,
  room: nonEmptyString.max(120),
});
const gameEndParams = z.object({ id: numericId });
const gameEndBody = z.object({
  winnerId: optionalNumericId,
  reward: z.coerce.number().nonnegative().optional(),
});
const gameWalletParams = z.object({ userId: numericId });
export const gameSchemas = {
  start: { body: gameStartBody },
  end: { params: gameEndParams, body: gameEndBody },
  wallet: { params: gameWalletParams },
};
// Match
const matchNextQuery = z.object({ userId: numericId });
const matchSwipeBody = z.object({
  userId: numericId,
  targetId: numericId,
  liked: z.boolean(),
});
export const matchSchemas = {
  next: { query: matchNextQuery },
  swipe: { body: matchSwipeBody },
};
// Payouts
const payoutOnboardBody = z.object({ creatorId: numericId });
const payoutRequestBody = z.object({
  creatorId: numericId,
  amount: z.coerce.number().gt(0),
});
export const payoutSchemas = {
  onboard: { body: payoutOnboardBody },
  request: { body: payoutRequestBody },
};
// PK Battles
const pkBattleCreateBody = z.object({
  creatorAId: numericId,
  creatorBId: numericId,
  startAt: isoDateString,
  endAt: isoDateString.optional(),
});
const pkBattleScoreParams = z.object({ battleId: numericId });
const pkBattleScoreBody = z.object({
  scoreA: z.coerce.number().int().nonnegative(),
  scoreB: z.coerce.number().int().nonnegative(),
});
const pkBattleConnectBody = z.object({
  url: urlString,
  token: nonEmptyString.max(500),
});
export const pkBattleSchemas = {
  create: { body: pkBattleCreateBody },
  scores: { params: pkBattleScoreParams, body: pkBattleScoreBody },
  stream: { params: pkBattleScoreParams },
  connect: { params: pkBattleScoreParams, body: pkBattleConnectBody },
};
// Privacy
const privacyParams = z.object({ userId: numericId });
const privacyBody = z.object({
  profileVisibility: nonEmptyString.max(32),
  allowDMs: booleanSchema,
  dataRetentionDays: z.coerce.number().int().min(1).max(365),
});
export const privacySchemas = {
  get: { params: privacyParams },
  set: { params: privacyParams, body: privacyBody },
};
// Stories
const storyCreateBody = z.object({
  creatorId: numericId,
  mediaUrl: urlString,
  expiresAt: isoDateString,
  visibility: nonEmptyString.max(32),
  tierId: safeIdentifier.optional(),
});
const storyDeleteParams = z.object({ id: safeIdentifier });
export const storySchemas = {
  list: {},
  create: { body: storyCreateBody },
  remove: { params: storyDeleteParams },
};
// Subscriptions
const subscriptionCheckoutBody = z.object({
  priceId: nonEmptyString.max(120),
  successUrl: urlString,
  cancelUrl: urlString,
  userId: safeIdentifier,
  tierId: safeIdentifier,
});
const subscriptionWebhookBody = z.object({ type: nonEmptyString.max(120) }).passthrough();
const subscriptionCancelBody = z.object({
  tierId: safeIdentifier,
  userId: safeIdentifier.optional(),
});
export const subscriptionSchemas = {
  checkout: { body: subscriptionCheckoutBody },
  webhook: { body: subscriptionWebhookBody },
  cancel: { body: subscriptionCancelBody },
};
// DM
const dmThreadBody = z.object({ recipientId: safeIdentifier });
const dmThreadParams = z.object({ id: safeIdentifier });
const dmMessageBody = z.object({
  cipher_text: nonEmptyString.max(10000),
  nonce: nonEmptyString.max(500),
  recipientId: safeIdentifier,
  burnAfterReading: z.boolean().optional(),
});
const dmMessageParams = z.object({ id: safeIdentifier });
export const dmSchemas = {
  createThread: { body: dmThreadBody },
  listThreads: {},
  threadMessages: { params: dmThreadParams },
  sendMessage: { params: dmThreadParams, body: dmMessageBody },
  readMessage: { params: dmMessageParams },
};
// DMCA
const dmcaCreateBody = z.object({
  reporterName: nonEmptyString.max(120),
  reporterEmail: z.string().email().max(320),
  contentLink: urlString,
});
const dmcaResolveParams = z.object({ id: numericId });
const dmcaResolveBody = z.object({
  status: nonEmptyString.max(50),
  resolution: z.string().min(5).max(2000),
});
export const dmcaSchemas = {
  create: { body: dmcaCreateBody },
  list: {},
  resolve: { params: dmcaResolveParams, body: dmcaResolveBody },
};
// Toys
const toyCreateBody = z.object({
  name: nonEmptyString.max(120).optional(),
  brand: z.enum(['Lovense', 'Demo']),
});
const toyIdParams = z.object({ id: nonEmptyString.max(120) });
export const toySchemas = {
  list: {},
  create: { body: toyCreateBody },
  remove: { params: toyIdParams },
};
// Patterns
const patternCreateBody = z.object({
  name: nonEmptyString.max(120),
  durationSec: z.coerce.number().int().min(1).max(3600).default(60),
  tags: z.array(nonEmptyString.max(32)).default([]),
});
const patternIdParams = z.object({ id: nonEmptyString.max(120) });
const patternRenameBody = z.object({ name: nonEmptyString.max(120) });
export const patternSchemas = {
  list: {},
  create: { body: patternCreateBody },
  rename: { params: patternIdParams, body: patternRenameBody },
  remove: { params: patternIdParams },
};
// Index routes
const creatorStatusParams = z.object({ username: safeIdentifier });
const creatorStatusBody = z.object({ isLive: z.coerce.boolean() });
const roomMutationParams = z.object({ room: nonEmptyString.max(120) });
const roomMutationBody = z.object({
  role: z.enum(['host', 'viewer']),
  identity: safeIdentifier,
});
export const indexSchemas = {
  creatorStatus: { params: creatorStatusParams, body: creatorStatusBody },
  roomJoin: { params: roomMutationParams, body: roomMutationBody },
  roomLeave: { params: roomMutationParams, body: roomMutationBody },
};
