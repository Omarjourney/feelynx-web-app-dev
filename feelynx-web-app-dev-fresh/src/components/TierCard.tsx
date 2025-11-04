import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TierCardProps {
  id: string;
  name: string;
  price: number;
  perks: string[];
  badge?: string | null;
  subscribed?: boolean;
  onSubscribe: (id: string) => void;
  onCancel?: (id: string) => void;
}

const TierCard = ({
  id,
  name,
  price,
  perks,
  badge,
  subscribed,
  onSubscribe,
  onCancel,
}: TierCardProps) => {
  return (
    <div className="border rounded p-4 space-y-2 bg-card">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{name}</h3>
        {badge && <Badge className="bg-gradient-primary text-primary-foreground">{badge}</Badge>}
      </div>
      <div className="text-sm text-muted-foreground">${price / 100} / month</div>
      <ul className="text-sm list-disc list-inside">
        {perks.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
      {subscribed ? (
        <Button variant="outline" onClick={() => onCancel?.(id)}>
          Cancel
        </Button>
      ) : (
        <Button onClick={() => onSubscribe(id)}>Subscribe</Button>
      )}
    </div>
  );
};

export default TierCard;
