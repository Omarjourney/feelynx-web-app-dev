import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Group } from '@/data/groups';
import { Link } from 'react-router-dom';

export const GroupCard = ({ group }: { group: Group }) => (
  <div className="border rounded-lg overflow-hidden bg-card">
    <img src={group.thumbnail} alt={group.name} className="w-full h-32 object-cover" />
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{group.name}</h3>
        {group.isLive && <Badge className="bg-live text-white">Live</Badge>}
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
      <div className="text-sm text-muted-foreground">👥 {group.members.toLocaleString()} members</div>
      <Link to={`/groups/${group.id}`}>
        <Button size="sm" className="w-full bg-gradient-primary text-primary-foreground">
          Open
        </Button>
      </Link>
    </div>
  </div>
);
