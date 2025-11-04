import { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWallet, selectWalletBalance } from '@/stores/useWallet';
import { toast } from 'sonner';

export interface TipModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}

const TipModal = ({ isVisible, onClose, onSubmit }: TipModalProps) => {
  const [amount, setAmount] = useState(10);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const balance = useWallet(selectWalletBalance);
  const addCoins = useWallet((state) => state.add);

  const send = () => {
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid tip amount greater than zero.');
      return;
    }

    if (amount > balance) {
      setError('Insufficient balance for this tip.');
      return;
    }

    setError('');
    onSubmit(amount);
    addCoins(-amount);
    toast.success('Tip sent', {
      description: `You tipped ${amount} coins. Remaining balance: ${Math.max(0, balance - amount).toLocaleString()}💎`,
    });
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="w-[90vw] max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto p-4 bottom-0 sm:inset-auto">
          {sent ? (
            <div className="p-6 text-center space-y-4">
              <div className="text-4xl">💖</div>
              <p className="font-semibold">Tip sent!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <Badge className="bg-gradient-primary text-primary-foreground">
                  Balance: {balance.toLocaleString()}💎
                </Badge>
              </div>
              <div className="flex space-x-2 justify-center">
                {[10, 50, 100].map((value) => (
                  <Button
                    key={value}
                    variant="secondary"
                    onClick={() => {
                      setAmount(value);
                      setError('');
                    }}
                  >
                    {value}💎
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                value={amount}
                onChange={(event) => {
                  setAmount(Number(event.target.value));
                  setError('');
                }}
                className="text-center"
              />
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button className="w-full bg-gradient-primary text-primary-foreground" onClick={send}>
                Send Tip
              </Button>
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default TipModal;
