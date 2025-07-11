import type {
  GameState,
  SeekerPosition,
  SelectHidingSpotPayload,
  UpdateSeekerPositionPayload,
} from '@hide-and-seek/shared';

export interface GameStateFeature {
  gameState: GameState;
  seekerActions: Record<string, { found: boolean }>;
  currentSeekerPosition: SeekerPosition | null;
  error: string | null;
}

export interface GameStore extends GameStateFeature {
  selectHidingSpot: (payload: SelectHidingSpotPayload) => Promise<void>;
  updateGameState: (gameState: GameState) => void;
  updateSeekerPosition: (position: SeekerPosition) => void;
  moveSeekerTo: (payload: UpdateSeekerPositionPayload) => Promise<void>;
  getCurrentTimeLeft: () => number;
  clearError: () => void;
  reset: () => void;
}
