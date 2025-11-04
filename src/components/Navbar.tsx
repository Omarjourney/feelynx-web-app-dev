import { useEffect } from 'react';
import { useWallet } from '@/stores/useWallet';

/**
 * Legacy navbar component retained for compatibility. Navigation is now handled by
 * {@link AppShell}. We still trigger a wallet sync here so consumers migrating from
 * the legacy layout keep wallet data in sync when this component is mounted.
 */
export const Navbar = () => {
  const fetchWallet = useWallet((state) => state.fetch);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return null;
};

export default Navbar;
