import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Env } from '@/constants/Env';
import { secureStorage } from '@/lib/secure-storage';
import type { GameState, GameStore } from './gameTypes';

const initialGameState: GameState = {
  error: null,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set) => {
      return {
        ...initialGameState,

        clearError: () => {
          set({ error: null });
        },

        reset: () => {
          set(initialGameState);
        },
      };
    },
    {
      name: `game-storage-${Env.APP_SLUG}`,
      storage: createJSONStorage(() => secureStorage),
      partialize: () => ({}),
    },
  ),
);
