import { Router } from 'express';
import { creators as frontendCreators } from '../../src/data/creators';

export interface Creator {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  country: string;
  specialty: string;
  isLive: boolean;
  followers: number;
  trendingScore: number;
  createdAt: string;
  lastOnline: string;
}

const parseFollowers = (followers: string): number => {
  const trimmed = followers.trim();
  if (trimmed.endsWith('k')) {
    const num = parseFloat(trimmed.slice(0, -1));
    return Math.round(num * 1000);
  }
  return parseInt(trimmed, 10);
};

const creators: Creator[] = frontendCreators.map((c, idx) => ({
  id: c.id,
  username: c.username.replace('@', ''),
  displayName: c.name,
  avatar: c.avatarUrl,
  country: c.country,
  specialty: Array.isArray(c.specialties) ? c.specialties[0] : c.specialties,
  isLive: c.isLive,
  followers: parseFollowers(c.subscribers),
  trendingScore: Math.floor(Math.random() * 100),
  createdAt: new Date(Date.now() - (idx + 1) * 1000 * 60 * 60 * 24).toISOString(),
  lastOnline: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24).toISOString(),
}));

const router = Router();

router.get('/', (req, res) => {
  let result = [...creators];
  const { country, specialty, isLive, search, sort } = req.query;

  if (country) {
    const value = String(country).toLowerCase();
    result = result.filter((c) => c.country.toLowerCase() === value);
  }

  if (specialty) {
    const value = String(specialty).toLowerCase();
    result = result.filter((c) => c.specialty.toLowerCase() === value);
  }

  if (typeof isLive !== 'undefined') {
    const value = String(isLive).toLowerCase() === 'true';
    result = result.filter((c) => c.isLive === value);
  }

  if (search) {
    const value = String(search).toLowerCase();
    result = result.filter(
      (c) =>
        c.username.toLowerCase().includes(value) ||
        c.displayName.toLowerCase().includes(value)
    );
  }

  if (sort) {
    const s = String(sort);
    if (s === 'trendingScore') {
      result.sort((a, b) => b.trendingScore - a.trendingScore);
    } else if (s === 'createdAt') {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (s === 'followers') {
      result.sort((a, b) => b.followers - a.followers);
    }
  }

  res.json(result);
});

router.post('/', (req, res) => {
  const creator = req.body as Creator;
  creator.id = creators.length ? creators[creators.length - 1].id + 1 : 1;
  creators.push(creator);
  res.status(201).json(creator);
});

export default router;
