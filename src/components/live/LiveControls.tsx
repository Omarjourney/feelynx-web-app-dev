import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export type LiveControlsProps = {
  isLive: boolean;
  isBusy?: boolean;
  onStart: () => Promise<void> | void;
  onEnd: () => Promise<void> | void;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  micEnabled: boolean;
  cameraEnabled: boolean;
};

export function LiveControls({
  isLive,
  isBusy,
  onStart,
  onEnd,
  onToggleMic,
  onToggleCamera,
  micEnabled,
  cameraEnabled,
}: LiveControlsProps) {
  const liveLabel = useMemo(() => (isLive ? 'End Stream' : 'Go Live'), [isLive]);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-white/50">Control Room</p>
          <p className="text-lg font-semibold text-white">
            {isLive ? 'Streaming to Feelynx Live' : 'Prepare your stage'}
          </p>
        </div>
        <Button
          onClick={isLive ? onEnd : onStart}
          disabled={isBusy}
          className={`rounded-full px-6 py-2 text-sm font-semibold uppercase tracking-wider shadow-[0_0_25px_rgba(236,72,153,0.35)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-fuchsia-400 ${
            isLive
              ? 'bg-gradient-to-r from-rose-500 via-fuchsia-500 to-purple-500 text-white hover:brightness-110'
              : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-500 text-slate-900 hover:brightness-105'
          }`}
          aria-live="polite"
        >
          {isBusy ? 'Please wait…' : liveLabel}
        </Button>
      </div>
      <Separator className="bg-white/10" />
      <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Live stream toggles">
        <Button
          variant="ghost"
          type="button"
          onClick={onToggleMic}
          disabled={isBusy}
          className={`rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors duration-200 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-fuchsia-400 ${
            micEnabled ? '' : 'ring-1 ring-rose-400/50'
          }`}
        >
          {micEnabled ? '🎤 Mic On' : '🔇 Mic Muted'}
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={onToggleCamera}
          disabled={isBusy}
          className={`rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors duration-200 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-fuchsia-400 ${
            cameraEnabled ? '' : 'ring-1 ring-rose-400/50'
          }`}
        >
          {cameraEnabled ? '📹 Camera On' : '📴 Camera Off'}
        </Button>
      </div>
    </div>
  );
}

export default LiveControls;
