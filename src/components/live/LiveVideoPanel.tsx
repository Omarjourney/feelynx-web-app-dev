import { MutableRefObject } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LiveVideoPanelProps {
  isConnected: boolean;
  onConnect: () => void;
  onOpenTip: () => void;
  videoRef: MutableRefObject<HTMLVideoElement | null>;
}

const LiveVideoPanel = ({ isConnected, onConnect, onOpenTip, videoRef }: LiveVideoPanelProps) => (
  <Card className="lg:col-span-3 bg-gradient-card">
    <CardContent className="p-0">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-glow/10">
            <div className="text-center space-y-4">
              <div className="text-6xl opacity-50">📹</div>
              <Button
                onClick={onConnect}
                className="bg-gradient-primary text-primary-foreground hover:shadow-glow"
              >
                Connect to Live Stream
              </Button>
              <p className="text-sm text-muted-foreground">Click to join the live video stream</p>
            </div>
          </div>
        )}
        {isConnected && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm">
                🎤 Mute
              </Button>
              <Button variant="secondary" size="sm">
                📹 Camera Off
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm" onClick={onOpenTip}>
                💝 Tip
              </Button>
              <Button variant="secondary" size="sm">
                🎮 Control Toy
              </Button>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default LiveVideoPanel;
