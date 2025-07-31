export interface Creator {
  id: number;
  name: string;
  username: string; // without @
  avatar?: string;
  country: string;
  age: number;
  tier: string;
  subscribers: string;
  isLive: boolean;
  viewers?: number;
  toyConnected?: string;
  videoRate: number;
  voiceRate: number;
  specialties: string[];
  earnings: string;
  status: string;
  initial: string;
  gradientColors: string;
  isFeatured?: boolean;
}
