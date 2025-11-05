import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@/stores/useWallet';
import type { MonetizationSnapshot } from '../../api/monetization';

const DEFAULT_CREATOR_ID = 'demo-creator';

async function fetchMonetization(creatorId: string): Promise<MonetizationSnapshot> {
  const search = new URLSearchParams({ creatorId });
  const response = await fetch(`/api/monetization?${search.toString()}`);
  if (!response.ok) {
    throw new Error('Unable to load monetization data');
  }

  return (await response.json()) as MonetizationSnapshot;
}

export const useMonetization = (creatorId?: string) => {
  const setWalletFromServer = useWallet((state) => state.setFromServer);

  const query = useQuery<MonetizationSnapshot>({
    queryKey: ['monetization', creatorId ?? DEFAULT_CREATOR_ID],
    queryFn: () => fetchMonetization(creatorId ?? DEFAULT_CREATOR_ID),
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
  });

  const { data } = query;

  useEffect(() => {
    if (!data) return;

    setWalletFromServer({
      coins: Math.round(data.sessionEarnings),
      updatedAt: data.timestamp,
    });
  }, [data, setWalletFromServer]);

  const tokensPerSecond = useMemo(() => {
    if (!data) return 0;
    return Number((data.tokenFlow / 60).toFixed(2));
  }, [data]);

  return {
    ...query,
    tokensPerSecond,
  };
};

export type UseMonetizationReturn = ReturnType<typeof useMonetization>;
