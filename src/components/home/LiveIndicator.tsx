import { cn } from '@/lib/utils';

type LiveIndicatorProps = {
  label?: string;
  className?: string;
};

export function LiveIndicator({ label = 'Live now', className }: LiveIndicatorProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-200 shadow-[0_0_0_1px_rgba(225,29,72,0.25)]',
        className,
      )}
    >
      <span className="relative h-2.5 w-2.5">
        <span className="absolute inset-0 rounded-full bg-rose-400" />
        <span className="absolute inset-0 animate-ping rounded-full bg-rose-400/60" />
      </span>
      {label}
    </span>
  );
}
