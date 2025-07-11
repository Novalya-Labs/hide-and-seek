import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Env } from '@/constants/Env';
import { secureStorage } from '@/lib/secure-storage';
import type { GameStateFeature, GameStore } from './gameTypes';
import { selectHidingSpot } from './select-hiding-spot/selectHidingSpot';

const initialGameState: GameStateFeature = {
  gameState: {
    phase: 'hiding',
    seeker: null,
    seekerAttempts: 0,
    maxAttempts: 3,
    currentRound: 1,
    winner: null,
    timeLeft: 0,
    phaseStartTime: 0,
  },
  seekerActions: {},
  error: null,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      return {
        ...initialGameState,

        selectHidingSpot: async (payload) => {
          try {
            await selectHidingSpot(payload);
            set({ gameState: { ...get().gameState, phase: 'seeking' } });
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to select hiding spot' });
          }
        },

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
