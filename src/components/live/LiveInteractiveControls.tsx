import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LiveInteractiveControlsProps {
  onOpenTip: () => void;
}

const LiveInteractiveControls = ({ onOpenTip }: LiveInteractiveControlsProps) => (
  <Card className="bg-gradient-card">
    <CardHeader>
      <CardTitle>Interactive Controls</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-20" onClick={onOpenTip}>
          💝
          <br />
          Tip 50💎
        </Button>
        <Button variant="outline" className="h-20">
          🌹
          <br />
          Send Rose
        </Button>
        <Button variant="outline" className="h-20">
          🎮
          <br />
          Control Toy
        </Button>
        <Button variant="outline" className="h-20">
          ⭐
          <br />
          Super Like
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default LiveInteractiveControls;
