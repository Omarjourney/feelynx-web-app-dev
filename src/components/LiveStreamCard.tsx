import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export interface LiveStreamCardProps {
  username: string;
  avatar: string;
  viewerCount: number;
  isFeatured?: boolean;
  streamPreviewUrl: string;
  badge?: string;
  onWatch?: () => void;
}

const LiveStreamCard = ({
  username,
  avatar,
  viewerCount,
  isFeatured,
  streamPreviewUrl,
  badge,
  onWatch,
}: LiveStreamCardProps) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [viewers, setViewers] = useState(viewerCount);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setViewers((v) => v + Math.floor(Math.random() * 3)), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setToast(`User${Math.floor(Math.random() * 100)} tipped 5💎`);
      setTimeout(() => setToast(null), 3000);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (onWatch) onWatch();
    else navigate(`/live/${username}`);
  };

  return (
    <div
      className="relative rounded-lg overflow-hidden border bg-card hover:shadow-glow transition cursor-pointer"
      onClick={handleClick}
    >
      <video
        ref={videoRef}
        src={streamPreviewUrl}
        className="w-full h-32 object-cover"
        muted
        loop
        autoPlay
        playsInline
        preload="none"
      />
      <div className="absolute top-2 left-2 flex items-center space-x-1">
        <Badge className="bg-live text-white">LIVE</Badge>
        {badge && <Badge className="bg-gradient-primary text-primary-foreground">{badge}</Badge>}
        {isFeatured && !badge && (
          <Badge className="bg-gradient-primary text-primary-foreground">NEW</Badge>
        )}
      </div>
      {toast && (
        <div className="absolute top-2 right-2 bg-background/90 text-sm px-2 py-1 rounded shadow">
          {toast}
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-background/80 text-xs px-2 py-1 rounded">
        {viewers.toLocaleString()} watching
      </div>
      <div className="flex items-center p-3 space-x-3">
        <img src={avatar} alt={`@${username}`} className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1">
          <p className="font-medium leading-none">@{username}</p>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamCard;
