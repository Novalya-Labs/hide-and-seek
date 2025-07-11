import type { GameState, HidingSpot, Player, Room, SeekerPosition } from '@hide-and-seek/shared';

export class GameService {
  selectRandomSeeker(room: Room, gameState?: GameState): Player {
    const eligiblePlayers = room.players.filter((p) => p.isAlive && !gameState?.previousSeekers.includes(p.socketId));

    if (eligiblePlayers.length === 0) {
      const randomIndex = Math.floor(Math.random() * room.players.length);
      const player = room.players[randomIndex];
      if (!player) {
        throw new Error('No players available to select as seeker');
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

  checkGameEndConditions(room: Room, gameState: GameState): 'ended' | 'results' | null {
    const alivePlayers = room.players.filter((p) => p.isAlive && p.socketId !== gameState.seeker);

    if (alivePlayers.length === 0 || gameState.seekerAttempts >= gameState.maxAttempts) {
      if (alivePlayers.length === 1) {
        gameState.winner = alivePlayers[0] || null;
        return 'ended';
      }
      if (alivePlayers.length > 1) {
        gameState.currentRound++;
        gameState.previousSeekers.push(gameState.seeker || '');
        return 'results';
      }
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
}
