import { Button } from '@/components/ui/button';
import { submitReport } from '@/lib/moderation/report';

interface ReportButtonProps {
  targetId: number | string;
  type: string;
}

const ReportButton = ({ targetId, type }: ReportButtonProps) => {
  const handleClick = async () => {
    const reason = window.prompt('Reason for report?');
    if (!reason) return;

    try {
      await submitReport({ reportedId: targetId, type, reason });
      alert('Report submitted');
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Unable to submit report. Please try again later.');
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleClick}>
      Report
    </Button>
  );
};

export default ReportButton;
