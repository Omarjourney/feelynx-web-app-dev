import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TierCard from '@/components/TierCard';
import { supabase } from '@/integrations/supabase/client';

interface Tier {
  id: string;
  name: string;
  price: number;
  perks: string | null;
  badge: string | null;
}

const Creator = () => {
  const { id } = useParams<{ id: string }>();
  const [tiers, setTiers] = useState<Tier[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('subscription_tiers')
        .select('id,name,price,perks,badge')
        .eq('creator_id', id);
      setTiers(data || []);
    };
    load();
  }, [id]);

  const subscribe = async (tierId: string) => {
    const res = await fetch('/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId: tierId, tierId }),
    });
    const json = await res.json();
    if (json.url) {
      window.location.href = json.url;
    }
  };

  const cancel = async (tierId: string) => {
    await fetch('/subscriptions/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tierId }),
    });
  };

  return (
    <div className="space-y-4">
      {tiers.map((t) => (
        <TierCard
          key={t.id}
          id={t.id}
          name={t.name}
          price={t.price}
          perks={(t.perks || '').split('\n').filter(Boolean)}
          badge={t.badge}
          onSubscribe={subscribe}
          onCancel={cancel}
        />
      ))}
    </div>
  );
};

export default Creator;
