import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ApiError, isApiError, request } from '@/lib/api';

interface Report {
  id: number;
  reportedId: number;
  type: string;
  reason: string;
  status: string;
}

const Moderation = () => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await request<Report[]>('/moderation/reports');
        setReports(data);
      } catch (error) {
        const apiError: ApiError | undefined = isApiError(error)
          ? error
          : undefined;
        console.error('Failed to fetch reports', error);
        if (apiError) {
          console.debug('API error details:', apiError);
        }
      }
    };
    loadReports();
  }, []);

  const act = async (reportId: number, action: string) => {
    try {
      await request('/moderation/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action }),
      });
      setReports((r) => r.filter((rep) => rep.id !== reportId));
    } catch (error) {
      const apiError: ApiError | undefined = isApiError(error)
        ? error
        : undefined;
      console.error('Failed to perform moderation action', error);
      if (apiError) {
        console.debug('API error details:', apiError);
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Pending Reports</h1>
      <ul className="space-y-2">
        {reports.map((r) => (
          <li key={r.id} className="border p-2 rounded">
            <div>Type: {r.type}</div>
            <div>Reason: {r.reason}</div>
            <Button size="sm" variant="secondary" onClick={() => act(r.id, 'ban')}>
              Ban
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Moderation;
