import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PremiumFeature } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface PremiumStore {
  isPremium: boolean;
  subscriptionId: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userEmail: string | null;
  setPremium: (isPremium: boolean, subscriptionId?: string, expiresAt?: string) => void;
  clearPremium: () => void;
  canAccess: (feature: PremiumFeature) => boolean;
  checkSubscription: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

export const usePremiumStore = create<PremiumStore>()(
  persist(
    (set, get) => ({
      isPremium: false,
      subscriptionId: null,
      expiresAt: null,
      isLoading: false,
      isAuthenticated: false,
      userEmail: null,

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
          isAuthenticated: false,
          userEmail: null,
        });
      },

      canAccess: (feature: PremiumFeature) => {
        const { isPremium, expiresAt } = get();
        if (!isPremium) return false;
        if (expiresAt && new Date(expiresAt) < new Date()) return false;
        return true;
      },

      checkAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const isAuthenticated = !!session?.user;
        set({
          isAuthenticated,
          userEmail: session?.user?.email || null,
        });
        return isAuthenticated;
      },

      checkSubscription: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) {
          // Check auth first
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;
          set({ isAuthenticated: true, userEmail: session.user.email || null });
        }

        set({ isLoading: true });
        try {
          const { data, error } = await supabase.functions.invoke('check-subscription');
          if (error) throw error;

          set({
            isPremium: data.subscribed === true,
            subscriptionId: data.product_id || null,
            expiresAt: data.subscription_end || null,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error checking subscription:', error);
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({
          isPremium: false,
          subscriptionId: null,
          expiresAt: null,
          isAuthenticated: false,
          userEmail: null,
        });
      },
    }),
    {
      name: 'piggy-bud-premium',
      partialize: (state) => ({
        isPremium: state.isPremium,
        subscriptionId: state.subscriptionId,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
        userEmail: state.userEmail,
      }),
    }
  )
);
