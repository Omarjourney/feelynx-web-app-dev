import { lazy, Suspense, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PageSection } from '@/components/layout/PageSection';
import { Button } from '@/components/ui/button';
import type { Creator } from '@/types/creator';

type CreatorGridSectionProps = {
  id: string;
  title: string;
  creators: Creator[];
  onSelect?: (id: number) => void;
  onViewAll?: () => void;
  viewAllLabel?: string;
  emptyState?: string;
};

const CreatorGrid = lazy(() => import('@/components/home/CreatorGrid'));

export function CreatorGridSection({ id, title, creators, onSelect, onViewAll, viewAllLabel, emptyState }: CreatorGridSectionProps) {
  const gridContent = useMemo(() => {
    if (!creators.length) {
      return (
        <p className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-sm text-white/70">
          {emptyState || 'No creators available right now. Check back soon!'}
        </p>
      );
    }

    return <CreatorGrid creators={creators} onSelect={onSelect} />;
  }, [creators, emptyState, onSelect]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <PageSection
        id={id}
        title={title}
        actions={
          onViewAll && (
            <Button variant="ghost" className="text-white/70 hover:text-white" onClick={onViewAll}>
              {viewAllLabel || 'View all'}
            </Button>
          )
        }
      >
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: Math.min(3, Math.max(creators.length, 1)) }).map((_, index) => (
                <div
                  key={`creator-skeleton-${index}`}
                  className="h-[380px] sm:h-[400px] lg:h-[420px] rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5"
                  aria-hidden
                />
              ))}
            </div>
          }
        >
          {gridContent}
        </Suspense>
      </PageSection>
    </motion.div>
  );
}
