import { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Payouts = () => {
  const [balance] = useState(0);
  const [amount, setAmount] = useState('');

  const requestPayout = async () => {
    await fetch('/payouts/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId: 1, amount: Number(amount) })
    });
    setAmount('');
  };

  const handleTaxUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Uploading tax form', file.name);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Payouts</h1>
      <div>
        <p className="mb-2">Balance: ${balance.toFixed(2)}</p>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button onClick={requestPayout}>Request Payout</Button>
        </div>
      </div>
      <div>
        <Label htmlFor="tax">Upload Tax Form</Label>
        <Input id="tax" type="file" onChange={handleTaxUpload} />
      </div>
    </div>
  );
};

export default Payouts;
