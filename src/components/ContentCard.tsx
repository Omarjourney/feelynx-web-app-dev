import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Lock, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import type { Post } from '@/data/posts';

interface ContentCardProps extends Post {}

const ContentCard = ({ id, username, avatar, mediaType, src, locked, price, tier, likes, comments, title, description, tags }: ContentCardProps) => {
  const [isUnlocked, setIsUnlocked] = useState(!locked);
  const handleUnlock = () => setIsUnlocked(true);
  const displayLocked = locked && !isUnlocked;
  const ContentIcon = mediaType === 'video' ? VideoIcon : ImageIcon;

  return (
    <div className="relative">
      <Dialog>
        <DialogTrigger asChild>
          <div className="group cursor-pointer overflow-hidden rounded-lg">
            {mediaType === 'image' ? (
              <img src={src} alt={title ?? username} className={`h-64 w-full object-cover ${displayLocked ? 'blur-md' : ''}`} />
            ) : (
              <video src={src} className={`h-64 w-full object-cover ${displayLocked ? 'blur-md' : ''}`} autoPlay muted loop />
            )}
            {displayLocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50">
                <Lock className="h-6 w-6 text-white" />
                {price ? (
                  <Badge className="bg-gradient-primary text-primary-foreground">{price}💎</Badge>
                ) : (
                  <Badge className="bg-gradient-primary text-primary-foreground">Subscribe</Badge>
                )}
              </div>
            )}
            {tier && (
              <Badge className="absolute left-2 top-2 bg-secondary text-secondary-foreground">{tier}</Badge>
            )}
            <div className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white">
              <ContentIcon className="h-4 w-4" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatar.startsWith('http') ? avatar : undefined} />
                  <AvatarFallback>{avatar}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-white">{username}</span>
              </div>
              <Button size="sm" variant="secondary" onClick={(e) => e.stopPropagation()}>Follow</Button>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-lg overflow-hidden p-0">
          <div className="relative">
            {mediaType === 'image' ? (
              <img src={src} alt={title ?? username} className={`w-full object-cover ${displayLocked ? 'blur-md' : ''}`} />
            ) : (
              <video src={src} className={`w-full object-cover ${displayLocked ? 'blur-md' : ''}`} autoPlay muted loop />
            )}
            {displayLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Button onClick={handleUnlock}>{price ? `Unlock for ${price}💎` : 'Unlock'}</Button>
              </div>
            )}
          </div>
          <div className="space-y-3 p-4">
            <h3 className="text-lg font-semibold">{title ?? username}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {tags && (
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
            )}
            <div className="flex gap-4">
              <Button variant="ghost" size="sm"><Heart className="mr-1 h-4 w-4" />{likes}</Button>
              <Button variant="ghost" size="sm"><MessageCircle className="mr-1 h-4 w-4" />{comments}</Button>
              <Button variant="ghost" size="sm"><Share2 className="mr-1 h-4 w-4" />Share</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentCard;

