import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { LovenseToy } from '@/lib/lovense';

/**
 * Toggle for pairing and vibrating a Lovense toy using the Web Bluetooth API.
 * Falls back gracefully if the API or device is unavailable.
 */
const LovenseToggle = () => {
  const [paired, setPaired] = useState(false);
  const [active, setActive] = useState(false);
  const toyRef = useState(() => new LovenseToy())[0];

  const handlePair = async () => {
    if (paired) {
      await toyRef.disconnect();
      setPaired(false);
      setActive(false);
      toast({ title: 'Toy disconnected' });
      return;
    }
    try {
      await toyRef.pair();
      setPaired(true);
      toast({ title: 'Toy paired' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not pair with toy';
      toast({
        title: 'Pairing failed',
        description: message,
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async () => {
    if (!paired) return;
    try {
      if (active) {
        await toyRef.vibrate(0);
      } else {
        await toyRef.vibrate(20);
      }
      setActive((prev) => !prev);
      toast({ title: active ? 'Toy stopped' : 'Toy activated' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not control toy';
      toast({
        title: 'Command failed',
        description: message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-x-2 flex items-center">
      <Button variant="secondary" size="sm" onClick={handlePair}>
        {paired ? 'Unpair Toy' : 'Pair Toy'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!paired}
        onClick={toggleActive}
        className={active ? 'animate-pulse' : ''}
      >
        {active ? 'Stop' : 'Vibrate'}
      </Button>
    </div>
  );
};

export default LovenseToggle;
