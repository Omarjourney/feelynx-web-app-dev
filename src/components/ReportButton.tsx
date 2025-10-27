import { Button } from '@/components/ui/button';
import { ApiError, isApiError, request } from '@/lib/api';

interface ReportButtonProps {
  targetId: number | string;
  type: string;
}

const ReportButton = ({ targetId, type }: ReportButtonProps) => {
  const handleClick = async () => {
    const reason = window.prompt('Reason for report?');
    if (!reason) return;
    try {
      await request<void>('/moderation/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportedId: targetId, type, reason }),
      });
      alert('Report submitted');
    } catch (error) {
      const apiError: ApiError | undefined = isApiError(error)
        ? error
        : undefined;
      const message = apiError?.message ?? 'Failed to submit report';
      alert(message);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleClick}>
      Report
    </Button>
  );
};

export default ReportButton;
