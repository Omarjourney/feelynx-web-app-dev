import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { submitReport } from '@/lib/moderation/report';
import { toast } from 'sonner';

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
      await submitReport({ reportedId: targetId, type, reason });
      toast.success('Report submitted. Thank you for keeping the community safe.');
    } catch (error) {
      console.error('Failed to submit report:', error);
      toast.error('Unable to submit report. Please try again later.');
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
