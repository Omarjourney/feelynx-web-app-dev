import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PatternsLibrary: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Patterns</h1>
        <p className="text-muted-foreground">
          Browse, preview, and create toy patterns. Sound-reactive and presets coming soon.
        </p>
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          This is a placeholder screen. Wire to pattern editor and library services.
        </div>
        <div>
          <Button onClick={() => navigate('/patterns/editor')}>Open Pattern Editor</Button>
        </div>
      </div>
    </div>
  );
};

export default PatternsLibrary;
