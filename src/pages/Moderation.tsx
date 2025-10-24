import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

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
    fetch('/moderation/reports')
      .then((r) => r.json())
      .then(setReports)
      .catch(() => {});
  }, []);

  const act = async (reportId: number, action: string) => {
    await fetch('/moderation/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, action }),
    });
    setReports((r) => r.filter((rep) => rep.id !== reportId));
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
