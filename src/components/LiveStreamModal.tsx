import React, { useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LiveStream } from '@/components/live';
import type { Creator } from '@/types/creator';
import { useEmotionUI } from '@/hooks/useEmotionUI';

interface LiveStreamModalProps {
  creator: Creator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LiveStreamModal = ({ creator, open, onOpenChange }: LiveStreamModalProps) => {
  const viewerCount = creator?.viewers ?? 0;
  const emotion = useEmotionUI({ viewerCount, engagementRate: 0.6, sentimentScore: 0.6, tokensPerMinute: 180 });
  const streamName = useMemo(() => creator?.name ?? 'Feelynx Creator', [creator?.name]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-3xl">
        {creator && (
          <LiveStream
            creatorName={streamName}
            viewers={viewerCount}
            onBack={() => onOpenChange(false)}
            emotion={emotion}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LiveStreamModal;
