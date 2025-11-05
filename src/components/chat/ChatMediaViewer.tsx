import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Attachment } from '@/state/chatStore';

export type ChatMediaViewerProps = {
  open: boolean;
  attachments: Attachment[];
  index: number;
  onClose: () => void;
};

export function ChatMediaViewer({ open, attachments, index, onClose }: ChatMediaViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousActive = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    previousActive.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = requestAnimationFrame(() => {
      containerRef.current?.focus();
    });
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      cancelAnimationFrame(frame);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open && previousActive.current) {
      previousActive.current.focus({ preventScroll: true });
    }
  }, [open]);

  const attachment = attachments[index];

  return (
    <AnimatePresence>
      {open && attachment ? (
        <motion.div
          key={attachment.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-6 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-label="Media viewer"
          onClick={onClose}
          ref={containerRef}
          tabIndex={-1}
        >
          <motion.img
            src={attachment.url}
            alt={attachment.alt ?? 'Shared image'}
            className="max-h-[90vh] max-w-[92vw] rounded-3xl border border-white/10 object-contain shadow-2xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            onClick={(event) => event.stopPropagation()}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default ChatMediaViewer;
