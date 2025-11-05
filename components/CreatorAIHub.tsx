import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { request } from '@/lib/api';
import { useTranslation } from '@/contexts/I18nContext';

interface CreatorAgentResponse {
  message: string;
  explanation?: string;
  schedule?: Array<{ day: string; start: string; focus: string }>;
  postDraft?: string;
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
  explanation?: string;
};

const CreatorAIHub = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingExplanation, setPendingExplanation] = useState<string | undefined>();

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      request<CreatorAgentResponse>('/api/agent/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      const contentParts = [data.message];
      if (data.postDraft) {
        contentParts.push(`\n\n${data.postDraft}`);
      }
      if (data.schedule?.length) {
        const scheduleText = data.schedule
          .map((slot) => `• ${slot.day}: ${slot.start} → ${slot.focus}`)
          .join('\n');
        contentParts.push(`\n${scheduleText}`);
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: contentParts.join('\n'), explanation: data.explanation }]);
      setPendingExplanation(undefined);
    },
    onError: (error: unknown) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: error instanceof Error ? error.message : t('creatorHub.error'),
        },
      ]);
    },
  });

  const sendMessage = (payload: Record<string, unknown>) => {
    const question = (payload.prompt as string) ?? input.trim();
    if (!question) return;
    const entry: Message = { role: 'user', content: question };
    setMessages((prev) => [...prev, entry]);
    setPendingExplanation(undefined);
    mutation.mutate(payload);
    setInput('');
  };

  const handleSend = () => {
    sendMessage({ prompt: input.trim() });
  };

  const handleAutoPlan = () => {
    sendMessage({ intent: 'autoPlanWeek', prompt: t('creatorHub.autoPlan') });
  };

  const handleGeneratePost = () => {
    sendMessage({ intent: 'generatePost', prompt: t('creatorHub.generatePost') });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('creatorHub.title')}</span>
          <Badge variant="secondary">Autonomous</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t('creatorHub.subtitle')}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-60 overflow-y-auto rounded-md border bg-muted/20 p-3 text-sm">
          {messages.length === 0 && <p className="text-muted-foreground">{t('creatorHub.empty')}</p>}
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className="mb-3">
              <p className="font-semibold capitalize">{message.role}</p>
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.explanation && (
                <button
                  type="button"
                  className="mt-1 text-xs text-primary underline"
                  onClick={() => setPendingExplanation(message.explanation)}
                >
                  {t('creatorHub.explanation')}
                </button>
              )}
            </div>
          ))}
        </div>
        {pendingExplanation && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-primary">
            {pendingExplanation}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t('creatorHub.inputPlaceholder')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSend} disabled={mutation.isLoading}>
            {mutation.isLoading ? t('creatorHub.loading') : t('creatorHub.send')}
          </Button>
          <Button type="button" variant="outline" onClick={handleAutoPlan} disabled={mutation.isLoading}>
            {t('creatorHub.autoPlan')}
          </Button>
          <Button type="button" variant="outline" onClick={handleGeneratePost} disabled={mutation.isLoading}>
            {t('creatorHub.generatePost')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CreatorAIHub;
