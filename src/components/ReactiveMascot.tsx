import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export type MascotMood = 'idle' | 'joined' | 'tipped' | 'hype' | 'guest';

interface ReactiveMascotProps {
  mood?: MascotMood;
  message?: string;
  className?: string;
}

const MOOD_EMOJI: Record<MascotMood, string> = {
  idle: '🦊',
  joined: '👋',
  tipped: '💖',
  hype: '⚡',
  guest: '🎭',
};

const MOOD_MESSAGES: Record<MascotMood, string> = {
  idle: 'Feely the fox is standing by.',
  joined: 'Someone just joined the party! Say hi!',
  tipped: 'Tips unlock special moves! Keep them coming!',
  hype: 'The room is heating up—bring the energy!',
  guest: 'Guest mode ready. Invite a friend to split the screen!',
};

export const ReactiveMascot = ({ mood = 'idle', message, className }: ReactiveMascotProps) => {
  const copy = useMemo(() => message || MOOD_MESSAGES[mood], [message, mood]);
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-full bg-secondary/70 px-4 py-2 text-sm text-secondary-foreground shadow-premium ring-1 ring-primary/40 backdrop-blur-lg animate-glow-pulse',
        className,
      )}
      aria-live="polite"
    >
      <span className="text-2xl leading-none" aria-hidden>
        {MOOD_EMOJI[mood]}
      </span>
      <span className="font-medium">{copy}</span>
    </div>
  );
};

export default ReactiveMascot;
