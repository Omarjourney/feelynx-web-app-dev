import React from 'react';

const ContestsFeed: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Contests</h1>
        <p className="text-muted-foreground">Feelynx-style submissions, voting, and live finals.</p>
        <ul className="list-disc pl-6 text-sm">
          <li>Cosplay Cup · Active · Free vote + coin boosts</li>
          <li>Dance Finals · Live vote counter</li>
        </ul>
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Placeholder for contest list and actions.
        </div>
      </div>
    </div>
  );
};

export default ContestsFeed;
