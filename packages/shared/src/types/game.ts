import { z } from 'zod';
import type { Player } from './room';

export const selectHidingSpotSchema = z.object({
  spotId: z.string(),
});

export const updateSeekerPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const checkHidingSpotSchema = z.object({
  spotId: z.string(),
  seekerPosition: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export type SelectHidingSpotPayload = z.infer<typeof selectHidingSpotSchema>;
export type UpdateSeekerPositionPayload = z.infer<typeof updateSeekerPositionSchema>;
export type CheckHidingSpotPayload = z.infer<typeof checkHidingSpotSchema>;

export type SeekerPosition = {
  x: number;
  y: number;
};

export type GamePhase = 'hiding' | 'seeking' | 'results' | 'ended';

export type GameState = {
  phase: GamePhase;
  seeker: string | null;
  seekerPosition: SeekerPosition | null;
  previousSeekers: string[];
  seekerAttempts: number;
  maxAttempts: number;
  currentRound: number;
  timeLeft: number;
  phaseStartTime: number;
  hiddenPlayers: Record<string, string>;
  checkedSpots: string[];
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
  occupiedBy?: string;
};
