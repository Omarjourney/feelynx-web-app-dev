import { ChangeEventHandler, KeyboardEventHandler } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
}

const quickTipAmounts = [5, 20, 50];

const LiveChatPanel = ({
  messages,
  messageDraft,
  onChange,
  onSend,
  onQuickTip,
  coinBalance,
}: LiveChatPanelProps) => {
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <Card className="h-fit border border-white/10 rounded-card shadow-base hover:shadow-elevated transition-shadow duration-300 bg-black/45 backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Chat</CardTitle>
          <span className="rounded-full bg-primary/20 px-3 py-1 text-xs text-primary-foreground">
            Balance: {coinBalance.toLocaleString()}💎
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className="relative inline-flex h-3 w-3 animate-glow-pulse rounded-full bg-live"
            aria-hidden
          />
          <span>NeonFox crew chat is buzzing · reactions trigger glow avatars</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-lg text-sm ${
                  msg.isHighlight ? 'bg-gradient-primary text-primary-foreground' : 'bg-secondary'
                }`}
              >
                <div className="font-medium">{msg.username}</div>
                <div className="opacity-90">{msg.message}</div>
                <div className="text-xs opacity-70">{msg.timestamp}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex space-x-2">
          <Input
            value={messageDraft}
            onChange={onChange}
            placeholder="Type a message..."
            onKeyDown={handleKeyDown}
            className="rounded-button bg-neutral-900/70 border border-white/10 focus:ring-2 focus:ring-primary focus:ring-offset-2 placeholder-gray-500"
          />
          <Button
            onClick={onSend}
            size="sm"
            className="rounded-button bg-gradient-to-r from-primary to-secondary text-white shadow-glow hover:scale-105 motion-safe:transition-transform motion-safe:duration-200"
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
