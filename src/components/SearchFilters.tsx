
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown } from "lucide-react";

export const SearchFilters = () => {
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [toyConnected, setToyConnected] = useState(false);

  return (
    <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search creators..." 
            className="pl-10 bg-background/50"
          />
        </div>
        
        {/* Filter Dropdowns */}
        <Button variant="outline" className="flex items-center space-x-2">
          <span>All Countries</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
        
        <Button variant="outline" className="flex items-center space-x-2">
          <span>All Ages</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
        
        <Button variant="outline" className="flex items-center space-x-2">
          <span>All Specialties</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
        
        {/* Toggle Switches */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
              onlineOnly ? 'bg-gradient-primary' : 'bg-secondary'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                onlineOnly ? 'translate-x-6' : 'translate-x-0'
              }`} />
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
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${
              toyConnected ? 'bg-gradient-primary' : 'bg-secondary'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                toyConnected ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
            <span className="text-sm">Toy Connected</span>
          </label>
        </div>
      </div>
    </div>
  );
};
