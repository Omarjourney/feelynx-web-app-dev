import { MutableRefObject } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface LiveVideoPanelProps {
  isConnected: boolean;
  onConnect: () => void;
  onOpenTip: () => void;
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  coinBalance: number;
  milestoneProgress: number;
  milestoneGoal: number;
  reactions: Array<{ id: number; icon: string; color: string }>;
  topFans: Array<{ name: string; amount: number }>;
  thanksMessage: string | null;
  toyConnected: boolean;
}

const LiveVideoPanel = ({
  isConnected,
  onConnect,
  onOpenTip,
  videoRef,
  coinBalance,
  milestoneProgress,
  milestoneGoal,
  reactions,
  topFans,
  thanksMessage,
  toyConnected,
}: LiveVideoPanelProps) => {
  const progressPercent = Math.min(100, Math.round((milestoneProgress / milestoneGoal) * 100));
  return (
    <Card className="lg:col-span-3 border border-border/60 bg-background/80">
      <CardContent className="p-0">
        <div className="relative aspect-video overflow-hidden rounded-3xl bg-black">
          <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline>
            <track kind="captions" srcLang="en" label="auto" />
          </video>

          {!isConnected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-primary/15 to-primary-glow/10 text-center">
              <div className="text-6xl opacity-50">📹</div>
              <Button
                onClick={onConnect}
                className="button-ripple bg-gradient-primary text-primary-foreground hover:shadow-glow"
              >
                Connect to Live Stream
              </Button>
              <p className="text-sm text-muted-foreground">Click to join the live video stream</p>
            </div>
          )}

          <div className="absolute left-4 top-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="rounded-full bg-background/70 px-3 py-1 text-foreground shadow-premium">
              Balance:{' '}
              <span className="font-semibold text-primary-foreground">
                💎 {coinBalance.toLocaleString()}
              </span>
            </div>
            <div className="rounded-full bg-background/70 px-3 py-1 shadow-premium">
              {toyConnected ? 'Interactive Toy Connected 💗' : 'Toy offline'}
            </div>
          </div>

          <div className="absolute right-4 top-4 flex flex-col gap-2 text-right text-xs text-muted-foreground">
            <div className="rounded-2xl bg-background/70 px-3 py-2 shadow-premium">
              <p className="uppercase tracking-widest">Top fans</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {topFans.map((fan, index) => (
                  <li key={fan.name} className="flex items-center justify-between gap-3">
                    <span className="font-medium">
                      #{index + 1} {fan.name}
                    </span>
                    <span className="text-primary-foreground">{fan.amount.toLocaleString()}💎</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 space-y-3">
            <div className="rounded-3xl bg-background/70 px-4 py-3 shadow-premium">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
                <span>Milestone goal</span>
                <span>
                  {milestoneProgress.toLocaleString()} / {milestoneGoal.toLocaleString()}💎
                </span>
              </div>
              <Progress value={progressPercent} className="mt-2 h-2 bg-background/60">
                <div
                  className="infinite-progress absolute inset-y-0 left-0 w-16 bg-primary/40"
                  aria-hidden
                />
              </Progress>
            </div>

            {thanksMessage && (
              <div className="flex items-center justify-center text-sm font-semibold text-primary-foreground">
                {thanksMessage}
              </div>
            )}

            {isConnected && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    🎤 Mute
                  </Button>
                  <Button variant="secondary" size="sm">
                    📹 Camera Off
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={onOpenTip}>
                    💝 Tip
                  </Button>
                  <Button variant="secondary" size="sm">
                    🎮 Control Toy
                  </Button>
                </div>
              </div>
            )}
          </div>

          {reactions.map((reaction) => (
            <div
              key={reaction.id}
              className="reaction-pop pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 text-3xl"
              style={{ color: reaction.color }}
              aria-hidden
            >
              {reaction.icon}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveVideoPanel;
