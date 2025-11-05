import type { NextFunction, Request, Response } from 'express';
import { z, type ZodTypeAny, ZodError } from 'zod';

const DANGEROUS_CHARS = /[<>`"'{}\\]/g;

export const sanitizeString = (value: string) => value.replace(DANGEROUS_CHARS, '').trim();

export const sanitizePayload = <T>(input: T): T => {
  if (typeof input === 'string') {
    return sanitizeString(input) as unknown as T;
  }
  if (Array.isArray(input)) {
    return input.map((item) => sanitizePayload(item)) as unknown as T;
  }
  if (input instanceof Date) {
    return new Date(input) as unknown as T;
  }
  if (input && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>).map(([key, value]) => [
        key,
        sanitizePayload(value),
      ]),
    ) as unknown as T;
  }
  return input;
};

export interface ValidationSchema {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

export type InferBody<T extends ValidationSchema> = T['body'] extends ZodTypeAny
  ? z.infer<T['body']>
  : never;
export type InferParams<T extends ValidationSchema> = T['params'] extends ZodTypeAny
  ? z.infer<T['params']>
  : never;
export type InferQuery<T extends ValidationSchema> = T['query'] extends ZodTypeAny
  ? z.infer<T['query']>
  : never;

type SchemaKey = keyof ValidationSchema;

const applySchema = (schema: ZodTypeAny | undefined, payload: unknown) => {
  if (!schema) {
    return undefined;
  }
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw result.error;
  }
  return sanitizePayload(result.data);
};

export const withValidation =
  (schemas: ValidationSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      (['body', 'params', 'query'] as SchemaKey[]).forEach((key) => {
        if (schemas[key]) {
          const value = applySchema(schemas[key], (req as any)[key]);
          if (value !== undefined) {
            (req as any)[key] = value;
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
const nonNegativeNumber = z.coerce.number().min(0);

// Auth
const authRegisterBody = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
});
const authLoginBody = authRegisterBody;

export const authSchemas = {
  register: { body: authRegisterBody },
  login: { body: authLoginBody },
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

// Rooms
const roomParams = z.object({ room: nonEmptyString.max(120) });
export const roomSchemas = {
  participants: { params: roomParams },
} satisfies Record<string, ValidationSchema>;

// Stream
export const streamSchemas = {
  start: { body: emptyObject },
  stop: { body: emptyObject },
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

// Analytics
const analyticsStreamParams = z.object({ streamId: safeIdentifier });
const analyticsCreatorParams = z.object({ creatorId: safeIdentifier });
export const analyticsSchemas = {
  stream: { params: analyticsStreamParams },
  creatorDaily: { params: analyticsCreatorParams },
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

// Payouts
const payoutOnboardBody = z.object({ creatorId: numericId });
const payoutRequestBody = z.object({
  creatorId: numericId,
  amount: z.coerce.number().gt(0),
});
export const payoutSchemas = {
  onboard: { body: payoutOnboardBody },
  request: { body: payoutRequestBody },
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

// Groups (Family crews)
const groupIdParams = z.object({ id: z.coerce.number().int().positive() });
const groupInviteVerifyBody = z.object({ code: nonEmptyString.max(120) });
const groupInviteRequestBody = z.object({ message: z.string().max(500).optional() });
export const groupSchemas = {
  inviteVerify: { params: groupIdParams, body: groupInviteVerifyBody },
  inviteRequest: { params: groupIdParams, body: groupInviteRequestBody },
  inviteApprove: {
    params: groupIdParams,
    body: z.object({ userId: nonEmptyString.max(120) }),
  },
  membership: { params: groupIdParams },
  inviteRequests: { params: groupIdParams },
} satisfies Record<string, ValidationSchema>;

// Highlights
const highlightEngagementPoint = z.object({
  timestamp: nonNegativeNumber,
  viewers: z.coerce.number().int().min(0),
  tokens: z.coerce.number().int().min(0),
  reactions: z.coerce.number().int().min(0),
});
const highlightListQuery = z.object({
  streamId: safeIdentifier.optional(),
});
const highlightGenerateBody = z.object({
  streamId: safeIdentifier,
  clipLength: z.coerce.number().int().min(10).max(20).optional(),
  engagement: z.array(highlightEngagementPoint).min(1),
});
const highlightParams = z.object({
  streamId: safeIdentifier,
  highlightId: safeIdentifier,
});
const highlightUpdateBody = z
  .object({
    start: nonNegativeNumber.optional(),
    end: z.coerce.number().min(1).optional(),
    title: nonEmptyString.max(120).optional(),
  })
  .refine((data) => {
    if (data.start === undefined || data.end === undefined) return true;
    return data.start < data.end;
  }, { message: 'start must be less than end' });
const highlightShareBody = z.object({
  platform: z
    .string()
    .min(2)
    .max(32)
    .transform((value) => value.toLowerCase()),
});
export const highlightsSchemas = {
  list: { query: highlightListQuery },
  generate: { body: highlightGenerateBody },
  update: { params: highlightParams, body: highlightUpdateBody },
  share: { params: highlightParams, body: highlightShareBody },
} satisfies Record<string, ValidationSchema>;

// Leaderboard
const leaderboardRecordBody = z.object({
  creatorId: safeIdentifier,
  creatorName: nonEmptyString.max(120),
  avatar: urlString.optional(),
  weeklyTokens: z.coerce.number().int().min(0),
  streakDays: z.coerce.number().int().min(0),
  lastShareRate: z.coerce.number().min(0).max(1).optional(),
});
export const leaderboardSchemas = {
  record: { body: leaderboardRecordBody },
} satisfies Record<string, ValidationSchema>;

// Referrals
const referralRecordBody = z.object({
  referrerId: safeIdentifier,
  referredId: safeIdentifier,
  referredType: z.enum(['creator', 'fan']),
  volume: z.coerce.number().min(0),
});
export const referralsSchemas = {
  record: { body: referralRecordBody },
} satisfies Record<string, ValidationSchema>;

// Emotion moderation
const emotionAnalyzeBody = z.object({
  text: z.string().min(1).max(1000),
});
export const emotionSchemas = {
  analyze: { body: emotionAnalyzeBody },
} satisfies Record<string, ValidationSchema>;

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
} satisfies Record<string, ValidationSchema>;

export type AuthRegisterBody = InferBody<typeof authSchemas.register>;
export type AuthLoginBody = InferBody<typeof authSchemas.login>;
export type PaymentIntentBody = InferBody<typeof paymentSchemas.createIntent>;
export type PaymentSuccessBody = InferBody<typeof paymentSchemas.success>;
export type GiftSendBody = InferBody<typeof giftSchemas.send>;
export type ModerationReportBody = InferBody<typeof moderationSchemas.report>;
export type ModerationActionBody = InferBody<typeof moderationSchemas.actions>;
export type MatchSwipeBody = InferBody<typeof matchSchemas.swipe>;
export type PrivacyBody = InferBody<typeof privacySchemas.set>;
export type StoryCreateBody = InferBody<typeof storySchemas.create>;
export type SubscriptionCheckoutBody = InferBody<typeof subscriptionSchemas.checkout>;
export type DmMessageBody = InferBody<typeof dmSchemas.sendMessage>;
export type DmcaCreateBody = InferBody<typeof dmcaSchemas.create>;
