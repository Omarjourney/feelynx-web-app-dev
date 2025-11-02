import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReportButton from '@/components/ReportButton';

interface LiveStreamHeaderProps {
  creatorName: string;
  viewers: number;
  onBack: () => void;
}

const LiveStreamHeader = ({ creatorName, viewers, onBack }: LiveStreamHeaderProps) => (
  <div className="flex items-center justify-between">
    <Button variant="outline" onClick={onBack}>
      ← Back
    </Button>
    <div className="text-center flex-1">
      <h1 className="text-2xl font-bold">{creatorName}</h1>
      <Badge className="bg-live text-white animate-pulse">
        🔴 LIVE • {viewers.toLocaleString()} viewers
      </Badge>
    </div>
    <ReportButton targetId={creatorName} type="stream" />
  </div>
);

export default LiveStreamHeader;
