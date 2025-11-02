'use client';

import { memo } from 'react';
import type { Creator } from '@/types/creator';
import { CreatorCard } from '@/components/CreatorCard';

type CreatorGridProps = {
  creators: Creator[];
  onSelect?: (id: number) => void;
};

function CreatorGridComponent({ creators, onSelect }: CreatorGridProps) {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
      role="list"
      aria-label="Creator profiles grid"
    >
      {creators.map((creator) => (
        <CreatorCard key={creator.id} creator={creator} onViewProfile={onSelect} />
      ))}
    </div>
  );
}

export default memo(CreatorGridComponent);
