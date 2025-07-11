import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Env } from '@/constants/Env';
import { secureStorage } from '@/lib/secure-storage';
import type { AuthState, AuthStore } from './authTypes';
import { login } from './login/login';

const initialAuthState: AuthState = {
  user: null,
  theme: 'system',
  loading: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => {
      return {
        ...initialAuthState,

        login: async (payload) => {
          set({ loading: true });
          try {
            const user = await login(payload);
            set({ user });
          } finally {
            set({ loading: false });
          }
        },

        setTheme: (theme) => {
          set({ theme });
        },

        setSocketId: (socketId) => {
          const user = get().user;

          if (!user) return;
          set({ user: { ...user, socketId } });
        },

        reset: () => {
          set(initialAuthState);
        },
      };
    },
    {
      name: `auth-storage-${Env.APP_SLUG}`,
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
      }),
    },
  ),
);
