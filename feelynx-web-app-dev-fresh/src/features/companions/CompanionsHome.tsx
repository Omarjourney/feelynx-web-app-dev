import React from 'react';

const CompanionsHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">AI Companions</h1>
        <p className="text-muted-foreground">
          Choose a persona and start a session. Consent-aware pattern suggestions and aftercare.
        </p>
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Placeholder for AI session list and creation.
        </div>
      </div>
    </div>
  );
};

export default CompanionsHome;
