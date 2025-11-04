import { ReactNode } from 'react';
import { BalanceBar } from '@/components/ui/BalanceBar';
import { SettingsDrawer } from '@/components/ui/SettingsDrawer';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet, selectWalletBalance } from '@/stores/useWallet';

interface HomeLayoutProps {
  children: ReactNode;
  showBalance?: boolean;
  coins?: number;
}

export const HomeLayout = ({ children, showBalance = true, coins }: HomeLayoutProps) => {
  const navigate = useNavigate();
  const walletCoins = useWallet(selectWalletBalance);
  const balance = coins ?? walletCoins;

  return (
    <div className="relative min-h-screen bg-transparent">
      <section className="relative overflow-x-hidden pb-[calc(9rem+var(--safe-area-bottom))]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-40" />

        {/* Top bar with balance and settings */}
        {showBalance && (
          <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-md border-b border-white/10 px-6 md:px-10 py-4">
            <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
              <BalanceBar coins={balance} />
              <SettingsDrawer />
            </div>
          </div>
        )}

        {/* Main content area with consistent spacing */}
        <div className="mx-auto max-w-6xl px-6 md:px-10 space-y-8 py-8">{children}</div>

        {/* Floating Action Button for "Go Live" */}
        <Button
          size="lg"
          className="fixed safe-fab-offset bg-pink-500 text-white rounded-full p-5 shadow-glow-strong hover:scale-105 transition-transform z-50 min-h-[60px] min-w-[60px]"
          onClick={() => navigate('/live-creator')}
          aria-label="Go Live - Start streaming"
          tabIndex={0}
        >
          <Video className="h-6 w-6" />
          <span className="ml-2 font-semibold">Go Live</span>
        </Button>
      </section>
    </div>
  );
};
