import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const GoLiveButton = () => {
  const [open, setOpen] = useState(false);
  const [mediaEnabled, setMediaEnabled] = useState(true);
  const [category, setCategory] = useState('chat');
  const [mediaError, setMediaError] = useState('');

  const handleStart = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaError('');
      // start stream logic placeholder
      setOpen(false);
    } catch (err) {
      setMediaError('Unable to access camera/microphone. Please check permissions.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-40 rounded-full bg-gradient-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 animate-pulse"
        >
          Go Live
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Stream</DialogTitle>
          <DialogDescription>Set up your live session</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="stream-title" className="block text-sm font-medium">
              Stream Title
            </label>
            <Input id="stream-title" placeholder="My awesome stream" />
          </div>
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chat">Just Chatting</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="media"
              checked={mediaEnabled}
              onCheckedChange={setMediaEnabled}
            />
            <label htmlFor="media" className="text-sm">
              Enable Camera &amp; Mic
            </label>
          </div>
          {mediaError && (
            <p className="text-sm text-destructive">{mediaError}</p>
          )}
          <Button
            className="w-full bg-gradient-primary text-primary-foreground"
            onClick={handleStart}
          >
            Start Stream
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoLiveButton;
