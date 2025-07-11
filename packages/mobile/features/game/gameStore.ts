import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Env } from '@/constants/Env';
import { secureStorage } from '@/lib/secure-storage';
import { socketService } from '@/services/socket.service';
import type { GameStateFeature, GameStore } from './gameTypes';
import { selectHidingSpot } from './select-hiding-spot/selectHidingSpot';

const initialGameState: GameStateFeature = {
  gameState: {
    phase: 'hiding',
    seeker: null,
    seekerPosition: null,
    previousSeekers: [],
    seekerAttempts: 0,
    maxAttempts: 3,
    currentRound: 1,
    winner: null,
    timeLeft: 0,
    phaseStartTime: 0,
    checkedSpots: [],
    hiddenPlayers: {},
  },
  seekerActions: {},
  currentSeekerPosition: null,
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
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to select hiding spot' });
          }
        },

        updateGameState: (gameState) => {
          set({ gameState });
        },

        updateSeekerPosition: (position) => {
          set({ currentSeekerPosition: position });
        },

        moveSeekerTo: async (payload) => {
          try {
            await new Promise<void>((resolve, reject) => {
              socketService.emitWithCallback('updateSeekerPosition', payload, (response) => {
                if (response.success) {
                  resolve();
                } else {
                  reject(new Error(response.error || 'Failed to update seeker position'));
                }
              });
            });
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to move seeker' });
          }
        },

        getCurrentTimeLeft: () => {
          const { gameState } = get();
          if (gameState.phase !== 'hiding' || !gameState.phaseStartTime) {
            return 0;
          }

          const elapsed = Date.now() - gameState.phaseStartTime;
          return Math.max(0, gameState.timeLeft - elapsed);
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
