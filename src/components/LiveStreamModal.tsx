import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LiveStream } from '@/components/live';
import type { Creator } from '@/types/creator';

interface LiveStreamModalProps {
  creator: Creator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LiveStreamModal = ({ creator, open, onOpenChange }: LiveStreamModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-3xl">
        {creator && (
          <LiveStream
            creatorName={creator.name}
            viewers={creator.viewers || 0}
            onBack={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LiveStreamModal;
