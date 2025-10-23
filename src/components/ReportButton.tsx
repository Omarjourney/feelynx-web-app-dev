import { Button } from '@/components/ui/button';

interface ReportButtonProps {
  targetId: number | string;
  type: string;
}

const ReportButton = ({ targetId, type }: ReportButtonProps) => {
  const handleClick = async () => {
    const reason = window.prompt('Reason for report?');
    if (!reason) return;
    await fetch('/moderation/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportedId: targetId, type, reason }),
    });
    alert('Report submitted');
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleClick}>
      Report
    </Button>
  );
};

export default ReportButton;
