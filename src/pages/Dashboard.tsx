import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => (
  <div className="container mx-auto p-4">
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Creator statistics will appear here.</p>
      </CardContent>
    </Card>
  </div>
);

export default Dashboard;
