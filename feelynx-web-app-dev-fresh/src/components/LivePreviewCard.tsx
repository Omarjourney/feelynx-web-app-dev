import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Creator {
  id: number;
  name: string;
  username: string;
  viewers?: number;
  initial: string;
  gradientColors: string;
  featured?: boolean;
  isLive?: boolean;
}

export const LivePreviewCard = ({ creator }: { creator: Creator }) => {
  const navigate = useNavigate();
  return (
    <div className="relative group rounded-lg overflow-hidden border bg-card">
      <div
        className={`h-40 flex items-center justify-center text-white text-7xl ${creator.gradientColors}`}
      >
        {creator.initial}
      </div>
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{creator.name}</h3>
          {creator.featured && (
            <Badge className="bg-gradient-primary text-primary-foreground">Featured</Badge>
          )}
        </div>
        {creator.isLive && (
          <Badge className="bg-live text-white">{creator.viewers?.toLocaleString()} watching</Badge>
        )}
        <Button
          size="sm"
          className="w-full mt-2 bg-gradient-primary text-primary-foreground"
          onClick={() => navigate(`/live/${creator.username}`)}
        >
          Join
        </Button>
      </div>
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        <span className="text-sm text-white">Live preview</span>
      </div>
    </div>
  );
};
