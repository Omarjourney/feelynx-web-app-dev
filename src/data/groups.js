import { UNSPLASH_RANDOM_BASE_URL } from '@/config';
export const groups = [
  {
    id: 1,
    name: 'VIP Lounge',
    description: 'Exclusive access for top fans',
    thumbnail: `${UNSPLASH_RANDOM_BASE_URL}400x300?sig=10`,
    members: 1200,
    isLive: true,
  },
  {
    id: 2,
    name: 'Behind the Scenes',
    description: 'Get a sneak peek into daily life',
    thumbnail: `${UNSPLASH_RANDOM_BASE_URL}400x300?sig=11`,
    members: 860,
  },
  {
    id: 3,
    name: 'Fitness Squad',
    description: 'Workouts and wellness tips',
    thumbnail: `${UNSPLASH_RANDOM_BASE_URL}400x300?sig=12`,
    members: 540,
  },
];
