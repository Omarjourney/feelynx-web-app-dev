export interface Creator {
  id: number;
  name: string;
  username: string;
  country: string;
  age: number;
  tier: string;
  subscribers: string;
  isLive: boolean;
  viewers?: number;
  lastSeen?: string;
  toyConnected?: string;
  videoRate: number;
  voiceRate: number;
  specialties: string[];
  earnings: string;
  status: string;
  isNew?: boolean;
}

export const creators: Creator[] = [
  {
    id: 1,
    name: "ArianaVex",
    username: "@arianavex",
    country: "United States",
    age: 24,
    tier: "Top 0.1%",
    subscribers: "12.8k",
    isLive: true,
    viewers: 2400,
    toyConnected: "Lovense Lush",
    videoRate: 35,
    voiceRate: 25,
    specialties: ["Interactive Shows", "Gaming"],
    earnings: "$5,240",
    status: "online"
  },
  {
    id: 2,
    name: "BlissfulBelle",
    username: "@blissfulbelle",
    country: "United Kingdom",
    age: 28,
    tier: "Premium",
    subscribers: "11.5k",
    isLive: false,
    lastSeen: "2 hours ago",
    videoRate: 40,
    voiceRate: 30,
    specialties: ["Luxury Content", "ASMR"],
    earnings: "$4,890",
    status: "online"
  },
  {
    id: 3,
    name: "MilaFox",
    username: "@milafox",
    country: "Germany",
    age: 26,
    tier: "VIP Creator",
    subscribers: "15.3k",
    isLive: true,
    viewers: 1200,
    toyConnected: "OhMiBod",
    videoRate: 45,
    voiceRate: 35,
    specialties: ["Premium Shows", "Fetish"],
    earnings: "$6,150",
    status: "online"
  },
  {
    id: 4,
    name: "SkylarNova",
    username: "@skylarnova",
    country: "Canada",
    age: 22,
    tier: "Rising Star",
    subscribers: "8.2k",
    isLive: true,
    viewers: 890,
    toyConnected: "Lovense Domi",
    videoRate: 30,
    voiceRate: 20,
    specialties: ["Gaming", "Cosplay"],
    earnings: "$3,420",
    status: "online"
  },
  {
    id: 5,
    name: "LunaRose",
    username: "@lunarose",
    country: "Australia",
    age: 25,
    tier: "Featured",
    subscribers: "9.7k",
    isLive: false,
    lastSeen: "30 minutes ago",
    videoRate: 38,
    voiceRate: 28,
    specialties: ["Intimate", "Roleplay"],
    earnings: "$4,100",
    status: "away"
  },
  {
    id: 6,
    name: "VioletStorm",
    username: "@violetstorm",
    country: "France",
    age: 23,
    tier: "New Model",
    subscribers: "3.2k",
    isLive: true,
    viewers: 450,
    toyConnected: "Lovense Edge",
    videoRate: 25,
    voiceRate: 18,
    specialties: ["New Model", "Interactive"],
    earnings: "$1,850",
    status: "online",
    isNew: true
  }
];