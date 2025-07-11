import type { GameState, SelectHidingSpotPayload } from '@hide-and-seek/shared';

export interface GameStateFeature {
  gameState: GameState;
  seekerActions: Record<string, { found: boolean }>;
  error: string | null;
}

export interface GameStore extends GameStateFeature {
  selectHidingSpot: (payload: SelectHidingSpotPayload) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}
