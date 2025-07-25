import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface SubscriptionPostProps {
  avatarUrl: string;
  contentUrl: string;
  isLocked: boolean;
  caption?: string;
  price?: number;
}

const SubscriptionPost = ({
  avatarUrl,
  contentUrl,
  isLocked,
  caption,
  price,
}: SubscriptionPostProps) => {
  const [liked, setLiked] = useState(false);
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative cursor-pointer">
            <img src={contentUrl} alt="post" className="w-full object-cover" />
            {isLocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm bg-black/40 space-y-2">
                {price ? (
                  <Badge className="bg-gradient-primary text-primary-foreground">Unlock for {price}💎</Badge>
                ) : (
                  <Badge className="bg-gradient-primary text-primary-foreground">Subscribe</Badge>
                )}
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="p-0">
          <img src={contentUrl} alt="preview" className="w-full object-cover" />
        </DialogContent>
      </Dialog>
      <div className="p-3 space-y-2">
        <div className="flex items-center space-x-2">
          <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full" />
          {caption && <p className="text-sm flex-1">{caption}</p>}
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setLiked(!liked)}>
            {liked ? 'Unlike' : 'Like'}
          </Button>
          <Button variant="ghost" size="sm">Tip</Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPost;
