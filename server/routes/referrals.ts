import { Router } from 'express';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import {
  referralsSchemas,
  withValidation,
  type InferBody,
} from '../utils/validation';

interface ReferralRecord {
  id: string;
  referrerId: string;
  referredId: string;
  referredType: 'creator' | 'fan';
  createdAt: string;
  expiresAt: string;
  bonusTier: 'Growth' | 'Pro' | 'Elite';
  status: 'active' | 'expired';
  earnings: number;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'referrals.json');

const BASE_RATE = 0.05;
const BONUS_RATE = 0.05;
const TIER_THRESHOLDS = {
  Growth: 0,
  Pro: 5,
  Elite: 15,
};

type ReferralSummary = {
  totals: {
    creators: number;
    fans: number;
    earnings: number;
  };
  active: ReferralRecord[];
  expired: ReferralRecord[];
  rewardRates: {
    base: number;
    bonus: number;
  };
};

const readReferrals = async (): Promise<ReferralRecord[]> => {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const records = JSON.parse(raw) as ReferralRecord[];
    return records.map((record) => ({
      ...record,
      status: new Date(record.expiresAt).getTime() < Date.now() ? 'expired' : 'active',
    }));
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const writeReferrals = async (records: ReferralRecord[]) => {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2));
};

const resolveBonusTier = (activeCount: number): ReferralRecord['bonusTier'] => {
  if (activeCount >= TIER_THRESHOLDS.Elite) return 'Elite';
  if (activeCount >= TIER_THRESHOLDS.Pro) return 'Pro';
  return 'Growth';
};

const buildSummary = (records: ReferralRecord[]): ReferralSummary => {
  const active = records.filter((record) => record.status === 'active');
  const expired = records.filter((record) => record.status === 'expired');

  const totals = active.reduce(
    (acc, record) => {
      if (record.referredType === 'creator') acc.creators += 1;
      if (record.referredType === 'fan') acc.fans += 1;
      acc.earnings += record.earnings;
      return acc;
    },
    { creators: 0, fans: 0, earnings: 0 },
  );

  const tier = resolveBonusTier(active.length);

  return {
    totals,
    active,
    expired,
    rewardRates: {
      base: BASE_RATE,
      bonus: tier === 'Growth' ? 0 : tier === 'Pro' ? BONUS_RATE * 0.5 : BONUS_RATE,
    },
  };
};

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const records = await readReferrals();
    res.json(buildSummary(records));
  } catch (error) {
    console.error('Failed to load referrals', error);
    res.status(500).json({ message: 'Failed to load referrals' });
  }
});

router.post(
  '/',
  withValidation(referralsSchemas.record),
  async (req, res) => {
    const payload = req.body as InferBody<typeof referralsSchemas.record>;

    try {
      const records = await readReferrals();
      const id = `${payload.referrerId}-${payload.referredId}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 365);

      const existingIndex = records.findIndex((record) => record.id === id);
      const activeCount = records.filter((record) => record.status === 'active').length;
      const tier = resolveBonusTier(activeCount + 1);
      const bonusRate = tier === 'Growth' ? 0 : tier === 'Pro' ? BONUS_RATE * 0.5 : BONUS_RATE;

      const earnings = payload.volume * (BASE_RATE + bonusRate);

      const nextRecord: ReferralRecord = {
        id,
        referrerId: payload.referrerId,
        referredId: payload.referredId,
        referredType: payload.referredType,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        bonusTier: tier,
        status: 'active',
        earnings,
      };

      if (existingIndex === -1) {
        records.push(nextRecord);
      } else {
        records[existingIndex] = nextRecord;
      }

      await writeReferrals(records);
      res.json(nextRecord);
    } catch (error) {
      console.error('Failed to record referral', error);
      res.status(500).json({ message: 'Failed to record referral' });
    }
  },
);

export default router;
