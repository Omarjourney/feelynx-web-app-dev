import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getUserMessage, toApiError } from '@/lib/errors';

interface ReportButtonProps {
  targetId: number | string;
  type: string;
}

const ReportButton = ({ targetId, type }: ReportButtonProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    if (isSubmitting) return;

    const reason = window.prompt('Reason for report?');
    if (!reason) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/moderation/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportedId: targetId, type, reason }),
      });

      if (!response.ok) {
        throw await toApiError(response);
      }

      toast.success('Report submitted. Thank you for keeping the community safe.');
    } catch (error) {
      console.error('Failed to submit report', error);
      toast.error(getUserMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleClick} disabled={isSubmitting}>
      {isSubmitting ? 'Submitting…' : 'Report'}
    </Button>
  );
};

export default ReportButton;
