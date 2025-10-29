import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

export interface SearchFiltersState {
  search: string;
  country: string;
  specialty: string;
  isLive: boolean;
  sort: 'trending' | 'newest' | 'followers';
}

export interface SearchFiltersProps extends SearchFiltersState {
  onChange: (filters: Partial<SearchFiltersState>) => void;
}

export const SearchFilters = ({
  search,
  country,
  specialty,
  isLive,
  sort,
  onChange,
}: SearchFiltersProps) => {
  const handleChange = (newFilters: Partial<SearchFiltersState>) => {
    onChange(newFilters);
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-[16rem]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            aria-label="Search creators"
            value={search}
            onChange={(e) => handleChange({ search: e.target.value })}
            placeholder="Search creators..."
            className="pl-10 bg-background/50"
          />
        </div>

        {/* Country Filter */}
        <Select
          value={country || 'all'}
          onValueChange={(value) => handleChange({ country: value })}
        >
          <SelectTrigger className="w-full sm:w-[140px] bg-background/50">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="au">Australia</SelectItem>
          </SelectContent>
        </Select>

        {/* Specialty Filter */}
        <Select
          value={specialty || 'all'}
          onValueChange={(value) => handleChange({ specialty: value })}
        >
          <SelectTrigger className="w-full sm:w-[140px] bg-background/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="interactive">Interactive</SelectItem>
            <SelectItem value="roleplay">Roleplay</SelectItem>
            <SelectItem value="fetish">Fetish</SelectItem>
            <SelectItem value="domination">Domination</SelectItem>
            <SelectItem value="girlfriend">Girlfriend</SelectItem>
            <SelectItem value="vanilla">Vanilla</SelectItem>
            <SelectItem value="milf">MILF</SelectItem>
            <SelectItem value="french">French</SelectItem>
            <SelectItem value="lingerie">Lingerie</SelectItem>
            <SelectItem value="lifestyle">Lifestyle</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
            <SelectItem value="gaming">Gaming</SelectItem>
            <SelectItem value="art">Art</SelectItem>
          </SelectContent>
        </Select>

        {/* Live Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="sr-only">Toggle live creators filter</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={isLive}
              onChange={(e) => handleChange({ isLive: e.target.checked })}
              className="sr-only"
            />
            <Button
              variant={isLive ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChange({ isLive: !isLive })}
              aria-pressed={isLive}
            >
              🔴 Live Only
            </Button>
          </div>
        </label>
      </div>

      {/* Sort Tabs */}
      <Tabs
        value={sort}
        onValueChange={(v) => handleChange({ sort: v as SearchFiltersState['sort'] })}
      >
        <TabsList className="flex w-full flex-wrap gap-2">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="newest">Newest</TabsTrigger>
          <TabsTrigger value="followers">Most Followers</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
