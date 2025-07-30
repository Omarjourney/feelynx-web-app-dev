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
  sort: string;
}

interface SearchFiltersProps extends SearchFiltersState {
  onChange: (v: Partial<SearchFiltersState>) => void;
}

export const SearchFilters = ({
  search,
  country,
  specialty,
  isLive,
  sort,
  onChange,
}: SearchFiltersProps) => {
  return (
    <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[16rem]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            aria-label="Search creators"
            value={search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search creators..."
            className="pl-10 bg-background/50"
          />
        </div>

        {/* Country */}
        <Select value={country} onValueChange={(v) => onChange({ country: v })}>
          <SelectTrigger className="w-32" aria-label="Filter by country">
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Countries</SelectItem>
            <SelectItem value="usa">USA</SelectItem>
            <SelectItem value="canada">Canada</SelectItem>
            <SelectItem value="uk">UK</SelectItem>
          </SelectContent>
        </Select>

        {/* Specialty */}
        <Select
          value={specialty}
          onValueChange={(v) => onChange({ specialty: v })}
        >
          <SelectTrigger className="w-36" aria-label="Filter by specialty">
            <SelectValue placeholder="All Specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Specialties</SelectItem>
            <SelectItem value="interactive">Interactive</SelectItem>
            <SelectItem value="roleplay">Roleplay</SelectItem>
            <SelectItem value="fetish">Fetish</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Tabs */}
        <Tabs
          value={sort}
          onValueChange={(v) => onChange({ sort: v })}
          className="ml-auto"
        >
          <TabsList>
            <TabsTrigger value="trendingScore">Trending</TabsTrigger>
            <TabsTrigger value="createdAt">New</TabsTrigger>
            <TabsTrigger value="followers">Most Followers</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Live Toggle */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            aria-label="Online only"
            checked={isLive}
            onChange={(e) => onChange({ isLive: e.target.checked })}
            className="sr-only"
          />
          <div
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              isLive ? 'bg-gradient-primary' : 'bg-secondary'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                isLive ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </div>
          <span className="text-sm">Live</span>
        </label>
      </div>
    </div>
  );
};
