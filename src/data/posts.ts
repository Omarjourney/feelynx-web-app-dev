import { z } from 'zod';
import { request } from '@/lib/api';

export interface Post {
  id: number;
  username: string;
  avatar: string;
  mediaType: 'image' | 'video';
  src: string;
  locked?: boolean;
  price?: number;
  tier?: string;
  likes: number;
  comments: number;
  title?: string;
  description?: string;
  tags?: string[];
}

const postSchema = z.object({
  id: z.union([z.number(), z.string()]),
  username: z.string(),
  avatar: z.string().optional(),
  mediaType: z.union([z.literal('image'), z.literal('video')]).default('image'),
  mediaUrl: z.string().optional(),
  src: z.string().optional(),
  locked: z.boolean().optional(),
  price: z.union([z.number(), z.string()]).optional(),
  tier: z.string().optional(),
  likes: z.union([z.number(), z.string()]).optional(),
  comments: z.union([z.number(), z.string()]).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type PostApi = z.infer<typeof postSchema>;

const toNumber = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value.replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export async function fetchPosts(signal?: AbortSignal): Promise<Post[]> {
  const data = await request<unknown>('/api/posts', { signal });
  const parsed = z.array(postSchema).safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid content feed payload received from API');
  }

  return parsed.data.map((item) => {
    const id = typeof item.id === 'string' ? Number.parseInt(item.id, 10) : item.id;
    const mediaSource = item.src ?? item.mediaUrl ?? '';
    return {
      id,
      username: item.username,
      avatar: item.avatar ?? item.username.charAt(0).toUpperCase(),
      mediaType: item.mediaType,
      src: mediaSource,
      locked: item.locked,
      price: typeof item.price === 'string' ? Number.parseFloat(item.price) : item.price,
      tier: item.tier,
      likes: toNumber(item.likes),
      comments: toNumber(item.comments),
      title: item.title,
      description: item.description,
      tags: item.tags?.filter((tag) => tag.trim().length > 0),
    } satisfies Post;
  });
}
