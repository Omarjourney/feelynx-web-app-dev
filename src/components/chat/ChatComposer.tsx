import { FormEvent, useEffect, useMemo, useRef, useState, type ChangeEventHandler, type KeyboardEventHandler } from 'react';

import { apiSendMessage } from '@/hooks/useChat';
import { useChatStore } from '@/state/chatStore';
import { cn } from '@/lib/utils';

type DraftFile = {
  file: File;
  preview: string;
};

export function ChatComposer() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { activeThreadId, addMessage, me, setTyping } = useChatStore();
  const [draftFiles, setDraftFiles] = useState<DraftFile[]>([]);
  const [draft, setDraft] = useState('');
  const draftFilesRef = useRef<DraftFile[]>([]);

  const canSend = useMemo(() => Boolean(draft.trim() || draftFiles.length), [draft, draftFiles.length]);

  useEffect(() => {
    draftFilesRef.current = draftFiles;
  }, [draftFiles]);

  useEffect(() => {
    return () => {
      draftFilesRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, []);

  const resetTyping = () => {
    if (activeThreadId && me) {
      setTyping(activeThreadId, me.id, false);
    }
  };

  const handleSend = async () => {
    if (!activeThreadId || !me || !canSend) {
      return;
    }
    const text = draft.trim();
    const files = draftFiles.map((item) => item.file);

    const message = await apiSendMessage({ threadId: activeThreadId, authorId: me.id, text, files });
    addMessage(message);
    draftFiles.forEach((item) => URL.revokeObjectURL(item.preview));
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setDraft('');
    setDraftFiles([]);
    resetTyping();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await handleSend();
  };

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    } else if (activeThreadId && me) {
      setTyping(activeThreadId, me.id, true);
    }
  };

  const handleInput: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    const target = event.currentTarget;
    setDraft(target.value);
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  };

  const handleBlur = () => {
    resetTyping();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    setDraftFiles((prev) => [
      ...prev,
      ...files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
    event.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setDraftFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return next;
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-white/10 bg-[#0b0618]/80 px-3 pb-safe pt-3 backdrop-blur-xl"
      aria-label="Message composer"
    >
      {draftFiles.length > 0 && (
        <div className="mb-3 flex gap-3 overflow-x-auto">
          {draftFiles.map((item, index) => (
            <div key={item.preview} className="relative h-20 w-20 flex-none overflow-hidden rounded-xl border border-white/10">
              <img src={item.preview} alt="Attachment preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white"
                aria-label="Remove attachment"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <label className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-xl transition hover:bg-white/15">
          <span role="img" aria-label="Add attachments">
            📎
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl text-white/80 transition hover:bg-white/15 hover:text-white"
          aria-label="Add emoji"
        >
          😊
        </button>
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onBlur={handleBlur}
            placeholder="Message…"
            rows={1}
            value={draft}
            aria-label="Message input"
            className="h-11 w-full resize-none rounded-3xl bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleSend()}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full bg-fuchsia-600/90 text-white shadow-lg shadow-fuchsia-500/30 transition hover:bg-fuchsia-500',
            !canSend && 'cursor-not-allowed opacity-60',
          )}
          aria-label="Send message"
          disabled={!canSend}
        >
          ➤
        </button>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg text-white/80 transition hover:bg-white/15 hover:text-white"
          aria-label="Record voice message"
        >
          🎤
        </button>
      </div>
    </form>
  );
}

export default ChatComposer;
