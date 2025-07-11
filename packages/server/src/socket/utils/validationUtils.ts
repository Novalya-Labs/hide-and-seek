import type { GameState, Player, Room } from '@hide-and-seek/shared';

export function validateGameStart(room: Room): void {
  if (room.players.length < 2) {
    throw new Error('Need at least 2 players to start the game');
  }

  if (room.status !== 'waiting') {
    throw new Error('Game has already started');
  }
}

export function validateHost(player: Player | undefined, hostSocketId: string): void {
  if (!player) {
    throw new Error('Player not found');
  }

  if (!player.isHost) {
    throw new Error('Only the host can perform this action');
  }

  if (player.socketId !== hostSocketId) {
    throw new Error('Socket ID mismatch');
  }
}

export function validateJoinRoom(room: Room, playerName: string): void {
  if (room.players.length >= room.maxPlayers) {
    throw new Error('Room is full');
  }

  if (room.status !== 'waiting') {
    throw new Error('Room is not accepting new players');
  }

  const existingPlayer = room.players.find((p) => p.username === playerName);
  if (existingPlayer) {
    throw new Error('Player name already taken in this room');
  }
}

export function validateHidingSpotSelection(gameState: GameState, socketId: string): void {
  if (gameState.phase !== 'hiding') {
    throw new Error('Not in hiding phase');
  }

  if (gameState.seeker === socketId) {
    throw new Error('Seeker cannot select hiding spot');
  }
}
