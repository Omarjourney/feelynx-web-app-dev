import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import IvibesLogo from '@/components/brand/IvibesLogo';
import { BRAND } from '@/config';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0B0720]/80 text-foreground">
        {BRAND.v2Wordmark ? (
          <IvibesLogo size={220} glow tagline="Loading your experience" />
        ) : (
          <span className="text-xl font-semibold">Loading...</span>
        )}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
