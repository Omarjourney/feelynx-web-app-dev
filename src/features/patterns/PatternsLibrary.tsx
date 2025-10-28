import React from 'react';

const PatternsLibrary: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Patterns</h1>
        <p className="text-muted-foreground">Browse, preview, and create toy patterns. Sound-reactive and presets coming soon.</p>
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          This is a placeholder screen. Wire to pattern editor and library services.
        </div>
      </div>
    </div>
  );
};

export default PatternsLibrary;

