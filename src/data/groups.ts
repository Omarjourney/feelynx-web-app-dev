export interface Group {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  members: number;
  isLive?: boolean;
}

export const groups: Group[] = [
  {
    id: 1,
    name: 'VIP Lounge',
    description: 'Exclusive access for top fans',
    thumbnail: 'https://source.unsplash.com/random/400x300?sig=10',
    members: 1200,
    isLive: true,
  },
  {
    id: 2,
    name: 'Behind the Scenes',
    description: 'Get a sneak peek into daily life',
    thumbnail: 'https://source.unsplash.com/random/400x300?sig=11',
    members: 860,
  },
  {
    id: 3,
    name: 'Fitness Squad',
    description: 'Workouts and wellness tips',
    thumbnail: 'https://source.unsplash.com/random/400x300?sig=12',
    members: 540,
  },
];
