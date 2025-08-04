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

export const posts: Post[] = [
  {
    id: 1,
    username: 'Aria Vex',
    avatar: 'A',
    mediaType: 'image',
    src: 'https://source.unsplash.com/random/800x600?sig=1',
    likes: 234,
    comments: 12,
    title: 'Sunset Tease',
    description: 'A dreamy sunset shot to start your evening.',
    tags: ['sunset', 'outdoor'],
  },
  {
    id: 2,
    username: 'Mila Fox',
    avatar: 'M',
    mediaType: 'video',
    src: 'https://source.unsplash.com/random/800x600?sig=2',
    locked: true,
    price: 15,
    likes: 188,
    comments: 20,
    title: 'Behind the Scenes',
    description: 'Sneak peek from my latest shoot.',
    tags: ['bts', 'teaser'],
  },
  {
    id: 3,
    username: 'Luna Star',
    avatar: 'L',
    mediaType: 'image',
    src: 'https://source.unsplash.com/random/800x600?sig=3',
    locked: true,
    tier: 'Gold',
    likes: 321,
    comments: 45,
    title: 'Golden Hour',
    description: 'Exclusive golden-hour portrait for Gold members.',
    tags: ['exclusive', 'portrait'],
  },
];
