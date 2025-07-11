import { z } from 'zod';
import type { Player } from './room';

export const selectHidingSpotSchema = z.object({
  spotId: z.string(),
});

export type SelectHidingSpotPayload = z.infer<typeof selectHidingSpotSchema>;

export type GamePhase = 'hiding' | 'seeking' | 'results' | 'ended';

export type GameState = {
  phase: GamePhase;
  seeker: string | null;
  seekerAttempts: number;
  maxAttempts: number;
  currentRound: number;
  timeLeft: number;
  phaseStartTime: number;
  winner: Player | null;
};

export type HidingSpot = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isOccupied: boolean;
};
