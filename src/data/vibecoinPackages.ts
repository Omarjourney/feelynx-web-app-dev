import { z } from 'zod';
import { request } from '@/lib/api';

export interface VibeCoinPackage {
  id: number;
  tokens: number;
  price: number;
  appPrice?: number;
  webBonus?: string;
  creatorSplit?: number;
  platformFee?: number;
  popular?: boolean;
}

const packageSchema = z.object({
  id: z.union([z.number(), z.string()]),
  tokens: z.union([z.number(), z.string()]),
  price: z.union([z.number(), z.string()]),
  appPrice: z.union([z.number(), z.string()]).optional(),
  webBonus: z.string().optional(),
  creatorSplit: z.union([z.number(), z.string()]).optional(),
  platformFee: z.union([z.number(), z.string()]).optional(),
  popular: z.boolean().optional(),
});

const toNumber = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export async function fetchVibeCoinPackages(signal?: AbortSignal): Promise<VibeCoinPackage[]> {
  const data = await request<unknown>('/api/payments/pricing', { signal });
  const parsed = z.array(packageSchema).safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid pricing payload received from API');
  }

  return parsed.data.map((pkg) => {
    const id = typeof pkg.id === 'string' ? Number.parseInt(pkg.id, 10) : pkg.id;
    const tokens = toNumber(pkg.tokens);
    const price = toNumber(pkg.price);
    const appPrice = pkg.appPrice != null ? toNumber(pkg.appPrice) : undefined;
    return {
      id,
      tokens,
      price,
      appPrice,
      webBonus: pkg.webBonus,
      creatorSplit: pkg.creatorSplit != null ? toNumber(pkg.creatorSplit) : undefined,
      platformFee: pkg.platformFee != null ? toNumber(pkg.platformFee) : undefined,
      popular: pkg.popular ?? false,
    } satisfies VibeCoinPackage;
  });
}
