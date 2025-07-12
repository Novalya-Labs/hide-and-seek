import type { GameState, HidingSpot, Player, Room, SeekerPosition } from '@hide-and-seek/shared';
import { logger } from '@/utils/logger';

export class GameService {
  selectRandomSeeker(room: Room, gameState?: GameState): Player {
    const eligiblePlayers = room.players.filter((p) => p.isAlive && !gameState?.previousSeekers.includes(p.socketId));

    if (eligiblePlayers.length === 0) {
      // If no eligible players, select from all alive players
      const alivePlayers = room.players.filter((p) => p.isAlive);
      if (alivePlayers.length === 0) {
        throw new Error('No alive players available to select as seeker');
      }
      const randomIndex = Math.floor(Math.random() * alivePlayers.length);
      const player = alivePlayers[randomIndex];
      if (!player) {
        throw new Error('No alive players available to select as seeker');
      }
      return player;
    }

    const randomIndex = Math.floor(Math.random() * eligiblePlayers.length);
    const player = eligiblePlayers[randomIndex];
    if (!player) {
      throw new Error('No eligible players available to select as seeker');
    }
    return player;
  }

  initializeGameState(seekerId: string): GameState {
    return {
      phase: 'hiding',
      seeker: seekerId,
      seekerPosition: null,
      previousSeekers: [],
      seekerAttempts: 0,
      maxAttempts: 3,
      currentRound: 1,
      timeLeft: 30000,
      phaseStartTime: Date.now(),
      hiddenPlayers: {},
      checkedSpots: [],
      winner: null,
    };
  }

  isPositionInSpot(position: SeekerPosition, spot: HidingSpot): boolean {
    // Safety check for invalid coordinates
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      return false;
    }
    if (
      Number.isNaN(position.x) ||
      Number.isNaN(position.y) ||
      !Number.isFinite(position.x) ||
      !Number.isFinite(position.y)
    ) {
      return false;
    }

    return (
      position.x >= spot.x &&
      position.x <= spot.x + spot.width &&
      position.y >= spot.y &&
      position.y <= spot.y + spot.height
    );
  }

  isSpotAlreadyChecked(gameState: GameState, spotId: string): boolean {
    return gameState.checkedSpots.includes(spotId);
  }

  checkGameEndConditions(room: Room, gameState: GameState, playersFoundThisRound: number): 'ended' | 'results' | null {
    const aliveHiders = room.players.filter((p) => p.isAlive && p.socketId !== gameState.seeker);

    if (aliveHiders.length === 0 || gameState.seekerAttempts >= gameState.maxAttempts) {
      // If seeker used all attempts, check if they found anyone
      if (gameState.seekerAttempts >= gameState.maxAttempts) {
        // If seeker found nobody, eliminate the seeker
        if (playersFoundThisRound === 0) {
          const seekerPlayer = room.players.find((p) => p.socketId === gameState.seeker);
          if (seekerPlayer) {
            seekerPlayer.isAlive = false;
            logger.info(`Seeker ${seekerPlayer.username} eliminated for finding no one in room`);
          }
        }
      }

      // Recalculate alive players after potential seeker elimination
      const allAlivePlayers = room.players.filter((p) => p.isAlive);

      // If only one player remains alive total, they win
      if (allAlivePlayers.length === 1) {
        gameState.winner = allAlivePlayers[0] || null;
        return 'ended';
      }

      // If multiple players remain alive total, check if we can continue with another round
      if (allAlivePlayers.length > 1) {
        // Check if there are eligible players who haven't been seeker yet
        const eligibleForNextRound = allAlivePlayers.filter((p) => !gameState.previousSeekers.includes(p.socketId));

        if (eligibleForNextRound.length === 0) {
          // All alive players have been seeker, game ends
          return 'ended';
        }

        // Continue to next round
        return 'results';
      }

      // No alive players left, game ends
      return 'ended';
    }

    return null;
  }

  areAllPlayersHidden(room: Room, gameState: GameState): boolean {
    const hiders = room.players.filter((p) => p.isAlive && p.socketId !== gameState.seeker);
    const hiddenCount = Object.keys(gameState.hiddenPlayers).length;
    return hiddenCount === hiders.length;
  }

  clearPlayerFromSpots(room: Room, socketId: string): void {
    room.map.hidingSpots.forEach((spot) => {
      if (spot.occupiedBy === socketId) {
        spot.isOccupied = false;
        delete spot.occupiedBy;
      }
    });
  }

  resetForNewRound(room: Room, gameState: GameState): void {
    // Clear all hiding spots
    room.map.hidingSpots.forEach((spot) => {
      spot.isOccupied = false;
      delete spot.occupiedBy;
    });

    // Reset game state for new round
    gameState.hiddenPlayers = {};
    gameState.checkedSpots = [];
    gameState.seekerAttempts = 0;
    gameState.seekerPosition = { x: 0, y: 0 };
    gameState.timeLeft = 30000;
    gameState.phaseStartTime = Date.now();

    // Add current seeker to previous seekers and increment round
    if (gameState.seeker) {
      gameState.previousSeekers.push(gameState.seeker);
    }
    gameState.currentRound++;
  }
}
