import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export interface LiveStreamCardProps {
  username: string;
  avatar: string;
  viewerCount: number;
  isFeatured?: boolean;
  streamPreviewUrl: string;
}

const LiveStreamCard = ({
  username,
  avatar,
  viewerCount,
  isFeatured,
  streamPreviewUrl,
}: LiveStreamCardProps) => {
  const navigate = useNavigate();
  return (
    <div
      className="relative rounded-lg overflow-hidden border bg-card hover:shadow-glow transition cursor-pointer"
      onClick={() => navigate(`/live/${username}`)}
    >
      <img src={streamPreviewUrl} alt="preview" className="w-full h-32 object-cover" />
      <div className="absolute top-2 left-2 flex items-center space-x-1">
        <Badge className="bg-live text-white">LIVE</Badge>
        {isFeatured && (
          <Badge className="bg-gradient-primary text-primary-foreground">NEW</Badge>
        )}
      </div>
      <div className="flex items-center p-3 space-x-3">
        <img
          src={avatar}
          alt={`@${username}`}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-medium leading-none">@{username}</p>
          <p className="text-sm text-muted-foreground">{viewerCount.toLocaleString()} watching</p>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamCard;
