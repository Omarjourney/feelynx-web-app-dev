import { useState } from 'react';
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

export interface SearchFiltersValues {
  search: string;
  country: string;
  specialty: string;
  isLive: boolean;
  sort: 'trending' | 'new' | 'followers';
}

interface SearchFiltersProps extends Partial<SearchFiltersValues> {
  onChange?: (values: Partial<SearchFiltersValues>) => void;
}

export const SearchFilters = ({
  search = '',
  country = '',
  specialty = '',
  isLive = false,
  sort = 'trending',
  onChange,
}: SearchFiltersProps) => {
  const [toyConnected, setToyConnected] = useState(false);

  const handleChange = (values: Partial<SearchFiltersValues>) => {
    onChange?.(values);
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[16rem]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            aria-label="Search creators"
            value={search}
            onChange={(e) => handleChange({ search: e.target.value })}
            placeholder="Search creators..."
            className="pl-10 bg-background/50"
          />
        </div>

        {/* Filter Dropdowns */}
        <Select value={country} onValueChange={(v) => handleChange({ country: v })}>
          <SelectTrigger aria-label="Country" className="min-w-[8rem]">
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Countries</SelectItem>
            <SelectItem value="USA">USA</SelectItem>
            <SelectItem value="Canada">Canada</SelectItem>
            <SelectItem value="UK">UK</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={specialty}
          onValueChange={(v) => handleChange({ specialty: v })}
        >
          <SelectTrigger aria-label="Specialty" className="min-w-[8rem]">
            <SelectValue placeholder="All Specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Specialties</SelectItem>
            <SelectItem value="Interactive">Interactive</SelectItem>
            <SelectItem value="Roleplay">Roleplay</SelectItem>
            <SelectItem value="Fetish">Fetish</SelectItem>
          </SelectContent>
        </Select>

        {/* Toggle Switches */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isLive}
              onChange={(e) => handleChange({ isLive: e.target.checked })}
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
            <span className="text-sm">Online Only</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={toyConnected}
              onChange={(e) => setToyConnected(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                toyConnected ? 'bg-gradient-primary' : 'bg-secondary'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  toyConnected ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-sm">Toy Connected</span>
          </label>
        </div>
      </div>
      <Tabs
        value={sort}
        onValueChange={(v) =>
          handleChange({ sort: v as SearchFiltersValues['sort'] })
        }
      >
        <TabsList className="flex w-full flex-wrap gap-2">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="followers">Most Followers</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
