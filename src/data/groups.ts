import { z } from 'zod';
import { request } from '@/lib/api';

export interface Group {
  id: number;
  name: string;
  description?: string;
  thumbnail?: string;
  members: number;
  isLive?: boolean;
  inviteCodeRequired?: boolean;
}

const groupSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  members: z.union([z.number(), z.string()]).optional(),
  isLive: z.boolean().optional(),
  inviteCodeRequired: z.boolean().optional(),
});

export type GroupApi = z.infer<typeof groupSchema>;

export async function fetchGroups(signal?: AbortSignal): Promise<Group[]> {
  const data = await request<unknown>('/api/groups', { signal });
  const parsed = z.array(groupSchema).safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid group payload received from API');
  }

  return parsed.data.map((group) => {
    const id = typeof group.id === 'string' ? Number.parseInt(group.id, 10) : group.id;
    const membersNumeric =
      typeof group.members === 'string'
        ? Number.parseInt(group.members.replace(/[^0-9]/g, ''), 10)
        : group.members ?? 0;

    return {
      id,
      name: group.name,
      description: group.description,
      thumbnail: group.thumbnail,
      members: Number.isNaN(membersNumeric) ? 0 : membersNumeric,
      isLive: group.isLive ?? false,
      inviteCodeRequired: group.inviteCodeRequired ?? true,
    } satisfies Group;
  });
}
