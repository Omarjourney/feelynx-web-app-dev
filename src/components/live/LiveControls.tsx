import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Power, Video, VideoOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type LiveControlsProps = {
  isLive: boolean;
  isConnecting?: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onGoLive: () => void;
  onEndStream: () => void;
  className?: string;
};

export function LiveControls({
  isLive,
  isConnecting,
  micEnabled,
  cameraEnabled,
  onToggleMic,
  onToggleCamera,
  onGoLive,
  onEndStream,
  className,
}: LiveControlsProps) {
  const statusLabel = useMemo(() => {
    if (isConnecting) return 'Connecting…';
    return isLive ? 'Live' : 'Offline';
  }, [isConnecting, isLive]);

  return (
    <motion.div
      layout
      className={cn(
        'flex w-full flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-black/40 px-6 py-4 text-white shadow-lg shadow-black/40 backdrop-blur-2xl',
        className,
      )}
      aria-label="Live controls"
    >
      <div className="flex items-center gap-3 text-sm uppercase tracking-wide text-white/60">
        <span className={cn('flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold', isLive ? 'bg-red-500/20 text-red-200' : 'bg-white/10 text-white/70')}>
          <span aria-hidden="true" className="text-base leading-none">
            {isLive ? '●' : '○'}
          </span>
          {statusLabel}
        </span>
        <span className="text-white/50">Mic {micEnabled ? 'on' : 'muted'}</span>
        <span className="text-white/50">Camera {cameraEnabled ? 'on' : 'off'}</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onToggleMic}
          aria-label={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
          className={cn(
            'h-12 rounded-full border border-white/10 bg-white/5 px-6 text-white/90 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-fuchsia-500/60',
            !micEnabled && 'text-white/60',
          )}
        >
          {micEnabled ? <Mic className="mr-2 h-5 w-5" /> : <MicOff className="mr-2 h-5 w-5" />}
          {micEnabled ? 'Mute' : 'Unmute'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onToggleCamera}
          aria-label={cameraEnabled ? 'Turn camera off' : 'Turn camera on'}
          className={cn(
            'h-12 rounded-full border border-white/10 bg-white/5 px-6 text-white/90 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-fuchsia-500/60',
            !cameraEnabled && 'text-white/60',
          )}
        >
          {cameraEnabled ? <Video className="mr-2 h-5 w-5" /> : <VideoOff className="mr-2 h-5 w-5" />}
          {cameraEnabled ? 'Camera off' : 'Camera on'}
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={isLive ? onEndStream : onGoLive}
          aria-label={isLive ? 'End stream' : 'Go live'}
          disabled={isConnecting}
          className={cn(
            'h-12 rounded-full px-6 text-white shadow-lg shadow-fuchsia-500/20 transition focus-visible:ring-2 focus-visible:ring-fuchsia-500/70',
            isLive
              ? 'border border-red-400/50 bg-gradient-to-r from-red-600/90 via-rose-600/90 to-red-500/80 hover:from-red-500 hover:to-rose-500'
              : 'border border-emerald-400/40 bg-gradient-to-r from-fuchsia-600/80 via-violet-600/80 to-sky-500/80 hover:from-fuchsia-500 hover:to-sky-400',
          )}
        >
          <Power className="mr-2 h-5 w-5" />
          {isLive ? 'End Stream' : 'Go Live'}
        </Button>
      </div>
    </motion.div>
  );
}

export default LiveControls;
