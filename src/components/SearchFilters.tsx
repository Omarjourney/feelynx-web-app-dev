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

  search: string;
  country: string;
  specialty: string;
  isLive: boolean;

  return (
    <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[16rem]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            aria-label="Search creators"
            value={search}

            placeholder="Search creators..."
            className="pl-10 bg-background/50"
          />
        </div>

            />
          </div>
          <span className="text-sm">Live</span>
        </label>
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
