import { Skeleton } from '@/components/ui/skeleton';

export function CreatorCardSkeleton() {
  return (
    <div className="rounded-lg border p-3 space-y-3 bg-card">
      <Skeleton className="h-40 w-full" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

export function LiveStreamCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border bg-card">
      <Skeleton className="h-40 w-full" />
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export function DMThreadSkeleton() {
  return (
    <div className="p-2 border-b last:border-b-0">
      <Skeleton className="h-4 w-2/5 mb-1" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  );
}

export function DMMessageSkeleton({ align = 'left' as 'left' | 'right' }) {
  const justify = align === 'left' ? 'justify-start' : 'justify-end';
  return (
    <div className={`flex ${justify}`}>
      <div className="max-w-[80%]">
        <Skeleton className="h-16 w-56 rounded-2xl" />
      </div>
    </div>
  );
}
