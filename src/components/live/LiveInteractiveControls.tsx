import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface LiveInteractiveControlsProps {
  onOpenTip: () => void;
  onQuickTip: (amount: number) => void;
  onReaction: (icon: string, color: string) => void;
  onInviteGuest: () => void;
  viewerLevel: number;
  xpProgress: number; // 0-1
  dailyStreak: number;
}

const reactions = [
  { icon: '💖', label: 'Hearts', color: '#ff6ad5' },
  { icon: '🔥', label: 'Fire', color: '#ff9153' },
  { icon: '🎁', label: 'Gift', color: '#ffd166' },
  { icon: '🎉', label: 'Confetti', color: '#6dd3ff' },
];

const tips = [5, 20, 50, 100];

const LiveInteractiveControls = ({
  onOpenTip,
  onQuickTip,
  onReaction,
  onInviteGuest,
  viewerLevel,
  xpProgress,
  dailyStreak,
}: LiveInteractiveControlsProps) => (
  <div className="grid gap-4 lg:grid-cols-3">
    <Card className="border border-border/60 bg-background/80">
      <CardHeader>
        <CardTitle className="text-lg">Reaction tiers</CardTitle>
        <CardDescription>Tap to send animated feedback without leaving chat.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {reactions.map((reaction) => (
          <Button
            key={reaction.label}
            variant="secondary"
            className="button-ripple h-16 flex-col gap-1 rounded-2xl"
            onClick={() => onReaction(reaction.icon, reaction.color)}
          >
            <span className="text-xl" aria-hidden>
              {reaction.icon}
            </span>
            <span className="text-xs uppercase tracking-widest">{reaction.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>

    <Card className="border border-border/60 bg-background/80">
      <CardHeader>
        <CardTitle className="text-lg">Quick tips</CardTitle>
        <CardDescription>One-tap support aligned with token conversions.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {tips.map((amount) => (
          <Button
            key={amount}
            className="button-ripple flex-1 rounded-2xl bg-gradient-primary text-primary-foreground"
            onClick={() => onQuickTip(amount)}
          >
            +{amount}💎
          </Button>
        ))}
        <Button
          variant="secondary"
          className="button-ripple flex-1 rounded-2xl"
          onClick={onOpenTip}
        >
          Open tip menu
        </Button>
      </CardContent>
    </Card>

    <Card className="border border-border/60 bg-background/80">
      <CardHeader>
        <CardTitle className="text-lg">Guest & progression</CardTitle>
        <CardDescription>Track your XP and invite co-hosts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="rounded-2xl bg-background/70 p-3 shadow-premium">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest">
            <span>Viewer level</span>
            <span>Lv. {viewerLevel}</span>
          </div>
          <Progress value={Math.min(100, Math.round(xpProgress * 100))} className="mt-2 h-2" />
          <p className="mt-2 text-xs">{Math.round((1 - xpProgress) * 500)} XP until next badge.</p>
        </div>
        <div className="rounded-2xl bg-background/70 p-3 shadow-premium">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest">
            <span>Login streak</span>
            <span>{dailyStreak} days</span>
          </div>
          <p className="mt-2 text-xs">Day 7 unlocks Lucky Spin with extra rewards.</p>
        </div>
        <Button className="button-ripple w-full rounded-2xl" onClick={onInviteGuest}>
          Invite guest to split-screen
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default LiveInteractiveControls;
