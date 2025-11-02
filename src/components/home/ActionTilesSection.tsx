import { motion } from 'framer-motion';
import type { ComponentType, ReactNode } from 'react';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageSection } from '@/components/layout/PageSection';
import { cn } from '@/lib/utils';

export type ActionTile = {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  actionLabel: string;
  onAction: () => void;
};

type ActionTilesSectionProps = {
  id: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  tiles: ActionTile[];
  gridClassName?: string;
};

export function ActionTilesSection({ id, title, description, actions, tiles, gridClassName }: ActionTilesSectionProps) {
  const gridClasses = gridClassName ?? 'grid gap-5 md:grid-cols-2 xl:grid-cols-4';

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <PageSection id={id} title={title} description={description} actions={actions}>
        <div className={cn(gridClasses)}>
          {tiles.map(
            ({ id: tileId, title: tileTitle, badge, description: tileDescription, icon: Icon, actionLabel, onAction }) => (
              <Card
                key={tileId}
                className="glass-panel h-full border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white/80">
                    <Icon className="h-5 w-5" aria-hidden />
                    <span className="text-[10px] uppercase tracking-[0.35em]">{badge}</span>
                  </div>
                  <CardTitle className="text-xl font-semibold text-white">{tileTitle}</CardTitle>
                  <CardDescription className="text-sm text-white/70">{tileDescription}</CardDescription>
                </div>
                <Button
                  className="mt-6 rounded-full bg-gradient-primary text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow"
                  size="sm"
                  onClick={onAction}
                >
                  {actionLabel}
                </Button>
              </Card>
            ),
          )}
        </div>
      </PageSection>
    </motion.div>
  );
}
