import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Post } from '@/data/posts';

export const PostCard = ({ post }: { post: Post }) => {
  const [liked, setLiked] = useState(false);
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="relative">
        {post.mediaType === 'image' ? (
          <img src={post.src} alt="post" className="w-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <video src={post.src} className="w-full" autoPlay muted loop />
        )}
        {post.locked && (
          <div className="absolute inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center">
            {post.price ? (
              <Badge className="bg-gradient-primary text-primary-foreground">
                Unlock for {post.price}💎
              </Badge>
            ) : (
              <Badge className="bg-gradient-primary text-primary-foreground">
                Subscribe {post.tier}
              </Badge>
            )}
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">{post.username}</span>
          <div className="space-x-2 text-sm text-muted-foreground">
            <span>❤️ {post.likes + (liked ? 1 : 0)}</span>
            <span>💬 {post.comments}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" onClick={() => setLiked(!liked)}>
            {liked ? 'Unlike' : 'Like'}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost">
                Tip
              </Button>
            </DialogTrigger>
            <DialogContent>
              <p className="text-center">Tipping coming soon...</p>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
