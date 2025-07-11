import type { JoinRoomWithCodePayload, Room, SocketResponse } from '@hide-and-seek/shared';
import type { Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { roomManager } from '../roomManager';

export const handleJoinRoomWithCode = (
  socket: Socket,
  payload: JoinRoomWithCodePayload,
  callback: (response: SocketResponse<Room>) => void,
): void => {
  try {
    logger.info(`Player ${payload.playerName} attempting to join room with code ${payload.code}`);

    const room = roomManager.joinRoomWithCode(payload.code, socket.id, payload.playerName, payload.avatar);

    if (!room) {
      callback({
        success: false,
        error: 'Room not found or invalid code',
      });
      return;
    }

    socket.join(room.id);

    socket.to(room.id).emit('playerJoined', room);

    callback({
      success: true,
      data: room,
    });

    logger.info(`Player ${payload.playerName} joined room ${room.id} with code ${payload.code} successfully`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to join room with code';
    logger.error(`Failed to join room with code: ${errorMessage}`);

    callback({
      success: false,
      error: errorMessage,
    });
  }
};
