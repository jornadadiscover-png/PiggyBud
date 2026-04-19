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
  setPin: (pin: string, userId?: string | null) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
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

// Hash PIN with SHA-256 so plaintext is never persisted to localStorage.
async function hashPin(pin: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// A stored value is treated as a hash if it's a 64-char hex string.
const isHash = (v: string | undefined) => !!v && /^[a-f0-9]{64}$/i.test(v);

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

      setPin: async (pin, userId = null) => {
        const hashed = await hashPin(pin);
        set((state) => ({
          settings: { ...state.settings, pin: hashed, pinEnabled: true },
          hasSetupPin: true,
          isLocked: false,
          pinUserId: userId ?? state.pinUserId,
        }));
      },

      verifyPin: async (pin) => {
        const { settings } = get();
        if (!settings.pin) return false;
        const entered = await hashPin(pin);
        if (isHash(settings.pin)) {
          return settings.pin === entered;
        }
        // Legacy plaintext PIN: compare then upgrade to hashed storage.
        if (settings.pin === pin) {
          set((state) => ({
            settings: { ...state.settings, pin: entered },
          }));
          return true;
        }
        return false;
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
