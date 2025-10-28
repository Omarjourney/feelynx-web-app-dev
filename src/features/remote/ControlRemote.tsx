import React from 'react';

const ControlRemote: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Universal Toy Remote</h1>
        <p className="text-muted-foreground">Connect devices, set safety caps, and control sessions. Emergency stop always available.</p>
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Placeholder for device adapters and control UI.
        </div>
      </div>
    </div>
  );
};

export default ControlRemote;

