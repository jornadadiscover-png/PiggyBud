import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PremiumFeature } from '@/types';

interface PremiumStore {
  isPremium: boolean;
  subscriptionId: string | null;
  expiresAt: Date | null;
  setPremium: (isPremium: boolean, subscriptionId?: string, expiresAt?: Date) => void;
  clearPremium: () => void;
  canAccess: (feature: PremiumFeature) => boolean;
}

export const usePremiumStore = create<PremiumStore>()(
  persist(
    (set, get) => ({
      isPremium: false,
      subscriptionId: null,
      expiresAt: null,

      setPremium: (isPremium, subscriptionId, expiresAt) => {
        set({
          isPremium,
          subscriptionId: subscriptionId || null,
          expiresAt: expiresAt || null,
        });
      },

      clearPremium: () => {
        set({
          isPremium: false,
          subscriptionId: null,
          expiresAt: null,
        });
      },

      canAccess: (feature: PremiumFeature) => {
        const { isPremium, expiresAt } = get();
        if (!isPremium) return false;
        if (expiresAt && new Date(expiresAt) < new Date()) return false;
        return true;
      },
    }),
    {
      name: 'piggy-bud-premium',
      partialize: (state) => ({
        isPremium: state.isPremium,
        subscriptionId: state.subscriptionId,
        expiresAt: state.expiresAt,
      }),
    }
  )
);
