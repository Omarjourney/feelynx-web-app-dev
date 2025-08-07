import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Group } from '@/data/groups';
import ReportButton from '@/components/ReportButton';

export const GroupCard = ({ group }: { group: Group }) => (
  <Dialog>
    <div className="border rounded-lg overflow-hidden bg-card">
      <img src={group.thumbnail} alt={group.name} className="w-full h-32 object-cover" />
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{group.name}</h3>
          {group.isLive && <Badge className="bg-live text-white">Live</Badge>}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
        <div className="text-sm text-muted-foreground">👥 {group.members.toLocaleString()} members</div>
        <DialogTrigger asChild>
          <Button size="sm" className="w-full bg-gradient-primary text-primary-foreground">Open</Button>
        </DialogTrigger>
      </div>
    </div>
    <DialogContent>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{group.name}</h2>
        <p>{group.description}</p>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          <p className="text-sm">Group chat coming soon...</p>
        </div>
          <div className="space-y-2">
            <Button size="sm" className="w-full bg-gradient-primary text-primary-foreground">
              Join Group
            </Button>
            <Button size="sm" variant="secondary" className="w-full">
              Schedule with Creator
            </Button>
            <ReportButton targetId={group.id} type="dm" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
