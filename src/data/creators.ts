import { z } from 'zod';
import { request } from '@/lib/api';
import type { Creator } from '@/types/creator';

const creatorApiSchema = z.object({
  id: z.union([z.number(), z.string()]),
  username: z.string().min(1, 'username required'),
  displayName: z.string().optional(),
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  avatar: z.string().optional(),
  country: z.string().optional(),
  tier: z.string().optional(),
  followers: z.number().optional(),
  subscribers: z.union([z.number(), z.string()]).optional(),
  isLive: z.boolean().optional(),
  liveViewers: z.number().optional(),
  viewers: z.number().optional(),
  specialties: z.array(z.string()).optional(),
  videoRate: z.number().optional(),
  voiceRate: z.number().optional(),
  rates: z
    .object({
      videoPerMinute: z.number().optional(),
      voicePerMinute: z.number().optional(),
    })
    .partial()
    .optional(),
  status: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

export type CreatorApi = z.infer<typeof creatorApiSchema>;

export interface FetchCreatorsParams {
  search?: string;
  country?: string;
  specialty?: string;
  isLive?: boolean;
  sort?: 'trending' | 'newest' | 'followers' | string;
}

const GRADIENTS = [
  'bg-gradient-to-br from-pink-500 to-purple-600',
  'bg-gradient-to-br from-blue-500 to-cyan-400',
  'bg-gradient-to-br from-orange-500 to-red-500',
  'bg-gradient-to-br from-green-500 to-emerald-400',
  'bg-gradient-to-br from-violet-500 to-purple-400',
  'bg-gradient-to-br from-rose-500 to-pink-400',
  'bg-gradient-to-br from-sky-500 to-indigo-500',
  'bg-gradient-to-br from-amber-500 to-rose-500',
];

const compactFormatter = Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function toCreator(api: CreatorApi, index: number): Creator {
  const id = typeof api.id === 'string' ? Number.parseInt(api.id, 10) : api.id;
  const rawName = api.displayName ?? api.name ?? api.username;
  const name = rawName?.trim() || api.username;
  const username = api.username.trim();
  const avatar = api.avatarUrl ?? api.avatar;
  const followersValue = typeof api.followers === 'number' ? api.followers : undefined;
  const subscribersValue =
    typeof api.subscribers === 'number'
      ? api.subscribers
      : typeof api.subscribers === 'string'
        ? Number.parseFloat(api.subscribers.replace(/[^0-9.]/g, ''))
        : followersValue;
  const videoRate = api.videoRate ?? api.rates?.videoPerMinute;
  const voiceRate = api.voiceRate ?? api.rates?.voicePerMinute;
  const specialties = api.specialties?.filter((item) => item.trim().length > 0) ?? [];
  const gradientColors = GRADIENTS[index % GRADIENTS.length];
  const initial = name.charAt(0).toUpperCase();
  const formattedSubscribers =
    subscribersValue != null ? compactFormatter.format(subscribersValue) : undefined;

  return {
    id,
    name,
    username,
    avatar,
    country: api.country,
    tier: api.tier,
    subscribers: formattedSubscribers,
    isLive: api.isLive ?? false,
    viewers: api.liveViewers ?? api.viewers ?? undefined,
    videoRate: videoRate != null ? Math.round(videoRate) : undefined,
    voiceRate: voiceRate != null ? Math.round(voiceRate) : undefined,
    specialties,
    earnings: undefined,
    status: api.status ?? (api.isLive ? 'online' : 'offline'),
    initial,
    gradientColors,
    isFeatured: api.isFeatured,
  };
}

function createQuery(params: FetchCreatorsParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.country && params.country !== 'all') query.set('country', params.country);
  if (params.specialty && params.specialty !== 'all') query.set('specialty', params.specialty);
  if (params.isLive) query.set('isLive', '1');
  if (params.sort) query.set('sort', params.sort);
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchCreators(
  params: FetchCreatorsParams = {},
  signal?: AbortSignal,
): Promise<Creator[]> {
  const query = createQuery(params);
  const data = await request<unknown>(`/api/creators${query}`, { signal });
  const parsed = z.array(creatorApiSchema).safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid creators payload received from API');
  }
  return parsed.data.map((item, index) => toCreator(item, index));
}
