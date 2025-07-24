import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

/** Simple Lovense toy pairing toggle. This does not implement the real API
 *  but mimics the user experience with a pulsing icon when active.
 */
const LovenseToggle = () => {
  const [paired, setPaired] = useState(false);
  const [active, setActive] = useState(false);

  const handlePair = () => {
    if (paired) {
      setPaired(false);
      setActive(false);
      toast({ title: "Toy disconnected" });
    } else {
      setPaired(true);
      toast({ title: "Toy paired" });
    }
  };

  const toggleActive = () => {
    if (!paired) return;
    setActive((prev) => !prev);
    toast({ title: active ? "Toy stopped" : "Toy activated" });
  };

  return (
    <div className="space-x-2 flex items-center">
      <Button variant="secondary" size="sm" onClick={handlePair}>
        {paired ? "Unpair Toy" : "Pair Toy"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!paired}
        onClick={toggleActive}
        className={active ? "animate-pulse" : ""}
      >
        {active ? "Stop" : "Vibrate"}
      </Button>
    </div>
  );
};

export default LovenseToggle;

