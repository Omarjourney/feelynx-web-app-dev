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
}

const LiveChatPanel = ({ messages, messageDraft, onChange, onSend }: LiveChatPanelProps) => {
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <Card className="bg-gradient-card h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Live Chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-lg text-sm ${
                  msg.isHighlight
                    ? 'bg-gradient-primary text-primary-foreground'
                    : 'bg-secondary'
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
          <Input value={messageDraft} onChange={onChange} placeholder="Type a message..." onKeyDown={handleKeyDown} />
          <Button onClick={onSend} size="sm">
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveChatPanel;
