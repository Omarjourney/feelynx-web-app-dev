import { ChangeEventHandler, KeyboardEventHandler, type CSSProperties } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EmotionTone } from '@/hooks/useEmotionUI';

export interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  isHighlight?: boolean;
}

interface LiveChatPanelProps {
  messages: ChatMessage[];
  messageDraft: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onSend: () => void;
  onQuickTip: (amount: number) => void;
  coinBalance: number;
  tone?: EmotionTone;
  glassStyles?: CSSProperties;
  compact?: boolean;
  quietMode?: boolean;
}

const quickTipAmounts = [5, 20, 50];

const toneBadge: Record<EmotionTone, string> = {
  warm: 'bg-gradient-to-r from-rose-500/40 via-pink-500/30 to-fuchsia-500/40 text-rose-50',
  violet: 'bg-gradient-to-r from-indigo-500/30 via-violet-500/25 to-purple-500/30 text-violet-50',
  cool: 'bg-gradient-to-r from-sky-500/30 via-cyan-500/25 to-blue-500/30 text-sky-50',
};

const toneHighlight: Record<EmotionTone, string> = {
  warm: 'bg-gradient-to-r from-pink-500/30 to-fuchsia-500/40 text-white',
  violet: 'bg-gradient-to-r from-violet-500/25 to-indigo-500/35 text-white',
  cool: 'bg-gradient-to-r from-sky-500/25 to-cyan-500/30 text-white',
};

const LiveChatPanel = ({
  messages,
  messageDraft,
  onChange,
  onSend,
  onQuickTip,
  coinBalance,
  tone = 'violet',
  glassStyles,
  compact,
  quietMode,
}: LiveChatPanelProps) => {
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSend();
    }
  };

  const highlightClass = toneHighlight[tone];
  const badgeClass = toneBadge[tone];
  const scrollHeight = compact ? 'h-56' : 'h-64';

  return (
    <Card
      className={cn(
        'h-fit rounded-card border shadow-base transition-shadow duration-500 backdrop-blur-md',
        quietMode ? 'opacity-80' : 'opacity-100',
      )}
      style={glassStyles}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Chat</CardTitle>
          <span className={cn('rounded-full px-3 py-1 text-xs shadow-base', badgeClass)}>
            Balance: {coinBalance.toLocaleString()}💎
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative inline-flex h-3 w-3 animate-glow-pulse rounded-full bg-live" aria-hidden />
          <span>
            {quietMode
              ? 'We softened the chat while vibes recalibrate.'
              : 'NeonFox crew chat is buzzing · reactions trigger glow avatars'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className={scrollHeight}>
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'rounded-lg p-3 text-sm shadow-sm transition-colors duration-300',
                  msg.isHighlight ? highlightClass : 'bg-white/8 text-white/90',
                )}
              >
                <div className="font-medium">{msg.username}</div>
                <div className="opacity-90">{msg.message}</div>
                <div className="text-xs opacity-70">{msg.timestamp}</div>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="rounded-xl bg-white/5 p-4 text-center text-sm text-white/60">
                The room is listening. Break the ice with a question! ✨
              </p>
            )}
          </div>
        </ScrollArea>
        <div className="flex space-x-2">
          <Input
            value={messageDraft}
            onChange={onChange}
            placeholder="Type a message..."
            onKeyDown={handleKeyDown}
            className="rounded-button border border-white/10 bg-neutral-900/70 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
          <Button
            onClick={onSend}
            size="sm"
            className={cn(
              'rounded-button text-white shadow-glow motion-safe:transition-transform motion-safe:duration-200 hover:scale-105',
              tone === 'warm'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                : tone === 'cool'
                  ? 'bg-gradient-to-r from-sky-500 to-cyan-500'
                  : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500',
            )}
          >
            Send
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {quickTipAmounts.map((amount) => (
            <Button
              key={amount}
              variant="secondary"
              size="sm"
              className="button-ripple rounded-full shadow-base hover:shadow-elevated motion-safe:transition-transform motion-safe:duration-200 hover:scale-105"
              onClick={() => onQuickTip(amount)}
            >
              +{amount}💎
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full shadow-base hover:shadow-elevated motion-safe:transition-transform motion-safe:duration-200 hover:scale-105"
            onClick={() => onQuickTip(200)}
          >
            Milestone boost +200💎
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveChatPanel;
