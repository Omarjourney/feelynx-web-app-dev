import { create } from 'zustand';
import { toast } from 'sonner';

type WalletResponse = {
  coins: number;
  updatedAt: string;
};

type WalletState = {
  coins: number;
  updatedAt: string | null;
  isLoading: boolean;
  fetch: () => Promise<void>;
  add: (amount: number) => void;
  setFromServer: (payload: WalletResponse) => void;
};

const INITIAL_STATE: Pick<WalletState, 'coins' | 'updatedAt' | 'isLoading'> = {
  coins: 0,
  updatedAt: null,
  isLoading: false,
};

export const useWallet = create<WalletState>((set, get) => ({
  ...INITIAL_STATE,
  async fetch() {
    const { isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true });

    try {
      const response = await fetch('/api/wallet', {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load wallet');
      }

      const data: WalletResponse = await response.json();
      set({ coins: data.coins, updatedAt: data.updatedAt, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      const message = error instanceof Error ? error.message : 'Wallet unavailable';
      toast.error('Unable to sync wallet', { description: message });
    }
  },
  add(amount) {
    if (Number.isNaN(amount) || amount === 0) return;
    set((state) => ({
      coins: Math.max(0, state.coins + amount),
      updatedAt: new Date().toISOString(),
    }));
  },
  setFromServer(payload) {
    set({ coins: payload.coins, updatedAt: payload.updatedAt, isLoading: false });
  },
}));

export const selectWalletBalance = (state: WalletState) => state.coins;
export const selectWalletLoading = (state: WalletState) => state.isLoading;
