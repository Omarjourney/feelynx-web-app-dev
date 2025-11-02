import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InviteRequest {
  user_id: string;
  message?: string;
  created_at?: string;
}

const GroupAdmin = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const parsedId = Number(groupId);
  const resolvedGroupId = Number.isFinite(parsedId) ? String(parsedId) : null;
  const [requests, setRequests] = useState<InviteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resolvedGroupId) {
      setRequests([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/groups/${resolvedGroupId}/invite/requests`);
        const data = await res.json();
        if (!active) return;
        setRequests(Array.isArray(data) ? data : []);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [resolvedGroupId]);

  const approve = async (userId: string) => {
    if (!resolvedGroupId) return;
    await fetch(`/api/groups/${resolvedGroupId}/invite/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    setRequests((prev) => prev.filter((r) => r.user_id !== userId));
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pending invites</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      <Card>
        <CardContent className="p-4 space-y-3">
          {loading && <div>Loading…</div>}
          {!loading && requests.length === 0 && <div>No pending requests</div>}
          {requests.map((r) => (
            <div key={r.user_id} className="flex items-center justify-between rounded border p-3">
              <div className="text-sm">
                <div className="font-medium">{r.user_id}</div>
                <div className="text-muted-foreground">{r.message || 'No message'}</div>
              </div>
              <div className="space-x-2">
                <Button size="sm" onClick={() => approve(r.user_id)}>
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupAdmin;
