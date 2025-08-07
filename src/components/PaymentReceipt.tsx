import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentReceiptProps {
  receiptUrl: string;
  disputeUrl: string;
}

export const PaymentReceipt = ({ receiptUrl, disputeUrl }: PaymentReceiptProps) => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Payment Receipt</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <a
        href={receiptUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline"
      >
        View receipt
      </a>
      <a
        href={disputeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-muted-foreground underline block"
      >
        Dispute this charge
      </a>
    </CardContent>
  </Card>
);

export default PaymentReceipt;
