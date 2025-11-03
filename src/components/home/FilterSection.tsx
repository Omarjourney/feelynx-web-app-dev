import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SearchFiltersState } from '@/components/SearchFilters';
import { SearchFilters } from '@/components/SearchFilters';

type FilterSectionProps = SearchFiltersState & {
  onChange: (state: Partial<SearchFiltersState>) => void;
  onOpenDirectory: () => void;
};

export function FilterSection({ onChange, onOpenDirectory, ...filters }: FilterSectionProps) {
  return (
    <motion.section
      aria-labelledby="creator-search"
      className="glass-panel"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold text-white">Tailor your feed</CardTitle>
            <CardDescription className="text-sm text-white/70">
              Smart filters remember your vibe and surface interactive sessions with the perfect pacing.
            </CardDescription>
          </div>
          <Button
            variant="secondary"
            className="rounded-full border border-white/20 bg-white/5 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 hover:text-white"
            onClick={onOpenDirectory}
          >
            Open directory
          </Button>
        </CardHeader>
        <CardContent className="rounded-3xl bg-black/20 p-6 backdrop-blur-xl">
          <SearchFilters {...filters} onChange={onChange} />
        </CardContent>
      </Card>
    </motion.section>
  );
}
