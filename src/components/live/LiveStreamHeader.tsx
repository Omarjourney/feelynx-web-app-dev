import { Share2 } from 'lucide-react';

import ReportButton from '@/components/ReportButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareOption {
  key: string;
  label: string;
}

interface LiveStreamHeaderProps {
  creatorName: string;
  viewers: number;
  onBack: () => void;
  shareOptions?: ShareOption[];
  onShare?: (platform: string) => void;
  shareDisabled?: boolean;
}

const LiveStreamHeader = ({
  creatorName,
  viewers,
  onBack,
  shareOptions,
  onShare,
  shareDisabled,
}: LiveStreamHeaderProps) => (
  <div className="flex items-center justify-between gap-3">
    <Button variant="outline" onClick={onBack}>
      ← Back
    </Button>
    <div className="flex flex-1 flex-col items-center">
      <h1 className="text-2xl font-bold">{creatorName}</h1>
      <Badge className="bg-live text-white animate-pulse">
        🔴 LIVE • {viewers.toLocaleString()} viewers
      </Badge>
    </div>
    <div className="flex items-center gap-2">
      {shareOptions && shareOptions.length > 0 && onShare ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" disabled={shareDisabled} className="rounded-full">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {shareOptions.map((option) => (
              <DropdownMenuItem
                key={option.key}
                onSelect={() => onShare(option.key)}
                className="capitalize"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      <ReportButton targetId={creatorName} type="stream" />
    </div>
  </div>
);

export default LiveStreamHeader;
