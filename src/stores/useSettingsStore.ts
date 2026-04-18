import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, UserProfile } from '@/types';

interface SettingsStore {
  settings: AppSettings;
  profile: UserProfile;
  isLocked: boolean;
  hasSetupPin: boolean;
  pinUserId: string | null; // Which user this PIN belongs to
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setPin: (pin: string, userId?: string | null) => void;
  verifyPin: (pin: string) => boolean;
  lock: () => void;
  unlock: () => void;
  resetPin: () => void;
  bindPinToUser: (userId: string | null) => void;
}

const defaultSettings: AppSettings = {
  reminderTime: '20:00',
  reactionSensitivity: 'medium',
  dailyReminderEnabled: true,
  weeklyReportEnabled: true,
  pinEnabled: false,
  pin: undefined,
  categoryBudgets: [],
};

const defaultProfile: UserProfile = {
  name: '',
  email: undefined,
  monthlyGoal: 3000,
  createdAt: new Date(),
  avatarUrl: undefined,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      profile: defaultProfile,
      isLocked: false,
      hasSetupPin: false,
      pinUserId: null,

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      updateProfile: (updates) => {
        set((state) => ({
          profile: { ...state.profile, ...updates },
        }));
      },

      setPin: (pin, userId = null) => {
        set((state) => ({
          settings: { ...state.settings, pin, pinEnabled: true },
          hasSetupPin: true,
          isLocked: false,
          pinUserId: userId ?? state.pinUserId,
        }));
      },

      verifyPin: (pin) => {
        const { settings } = get();
        return settings.pin === pin;
      },

      lock: () => {
        const { settings } = get();
        if (settings.pinEnabled && settings.pin) {
          set({ isLocked: true });
        }
      },

      unlock: () => {
        set({ isLocked: false });
      },

      resetPin: () => {
        set((state) => ({
          settings: { ...state.settings, pin: undefined, pinEnabled: false },
          hasSetupPin: false,
          isLocked: false,
          pinUserId: null,
        }));
      },

      bindPinToUser: (userId) => {
        const { pinUserId, settings } = get();
        // If PIN belongs to a different user, clear it
        if (pinUserId && userId && pinUserId !== userId) {
          set({
            settings: { ...settings, pin: undefined, pinEnabled: false },
            hasSetupPin: false,
            isLocked: false,
            pinUserId: userId,
          });
        } else if (!pinUserId && userId) {
          set({ pinUserId: userId });
        }
      },
    }),
    {
      name: 'piggy-bud-settings',
      partialize: (state) => ({
        settings: state.settings,
        profile: state.profile,
        hasSetupPin: state.hasSetupPin,
        pinUserId: state.pinUserId,
      }),
      onRehydrateStorage: () => (state) => {
        // Lock on app start if PIN is enabled
        if (state?.settings.pinEnabled && state?.settings.pin) {
          state.isLocked = true;
        }
      },
    }
  )
);
