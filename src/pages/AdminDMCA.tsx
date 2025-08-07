import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface Notice {
  id: number;
  reporterName: string;
  reporterEmail: string;
  contentLink: string;
  status: string;
  resolution: string | null;
}

const AdminDMCA = () => {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    fetch('/dmca')
      .then((r) => r.json())
      .then(setNotices);
  }, []);

  const resolve = async (id: number) => {
    const resolution = prompt('Resolution') || '';
    const res = await fetch(`/dmca/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved', resolution })
    });
    const updated = await res.json();
    setNotices((n) => n.map((notice) => (notice.id === id ? updated : notice)));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">DMCA Notices</h1>
      <ul className="space-y-2">
        {notices.map((notice) => (
          <li key={notice.id} className="border p-2 rounded">
            <div className="font-semibold">{notice.contentLink}</div>
            <div>Status: {notice.status}</div>
            {notice.resolution && <div>Resolution: {notice.resolution}</div>}
            <Button className="mt-2" onClick={() => resolve(notice.id)}>
              Resolve
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDMCA;
