import type { GameState, SeekerPosition } from '@hide-and-seek/shared';
import type { Server } from 'socket.io';
import { logger } from '@/utils/logger';

export class SocketService {
  constructor(private io: Server) {}

  emitGameStateUpdate(roomId: string, gameState: GameState): void {
    this.io.to(roomId).emit('gameStateUpdated', gameState);
    logger.debug(`Game state updated for room ${roomId}, phase: ${gameState.phase}`);
  }

  emitSeekerMovement(roomId: string, position: SeekerPosition): void {
    this.io.to(roomId).emit('seekerMovement', position);
  }

  emitPlayerFound(roomId: string, playerUsername: string): void {
    this.io.to(roomId).emit('playerFound', { username: playerUsername });
    logger.info(`Player found event emitted for room ${roomId}: ${playerUsername}`);
  }

  emitError(socketId: string, error: string): void {
    this.io.to(socketId).emit('error', error);
    logger.error(`Error emitted to socket ${socketId}: ${error}`);
  }

  joinRoom(socketId: string, roomId: string): void {
    this.io.sockets.sockets.get(socketId)?.join(roomId);
    logger.debug(`Socket ${socketId} joined room ${roomId}`);
  }

  leaveRoom(socketId: string, roomId: string): void {
    this.io.sockets.sockets.get(socketId)?.leave(roomId);
    logger.debug(`Socket ${socketId} left room ${roomId}`);
  }
}
