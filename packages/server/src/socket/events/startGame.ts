import type { Room, SocketResponse, StartGamePayload } from '@hide-and-seek/shared';
import type { Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { roomManager } from '../roomManager';

export const handleStartGame = (
  socket: Socket,
  payload: StartGamePayload,
  callback: (response: SocketResponse<Room>) => void,
): void => {
  try {
    logger.info(`Starting game in room ${payload.roomId}`);

    const room = roomManager.startGame(payload.roomId, socket.id);

    if (!room) {
      callback({
        success: false,
        error: 'Room not found',
      });
      return;
    }

    socket.to(room.id).emit('gameStarted', room);

    callback({
      success: true,
      data: room,
    });

    logger.info(`Game started in room ${room.id} successfully`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to start game';
    logger.error(`Failed to start game: ${errorMessage}`);

    callback({
      success: false,
      error: errorMessage,
    });
  }
};
