import type { JoinRoomPayload, Room, SocketResponse } from '@hide-and-seek/shared';
import type { Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { roomManager } from '../roomManager';

export const handleJoinRoom = (
  socket: Socket,
  payload: JoinRoomPayload,
  callback: (response: SocketResponse<Room>) => void,
): void => {
  try {
    logger.info(`Player ${payload.playerName} attempting to join room ${payload.roomId}`);

    const room = roomManager.joinRoom(payload.roomId, socket.id, payload.playerName, payload.avatar);

    if (!room) {
      callback({
        success: false,
        error: 'Room not found',
      });
      return;
    }

    socket.join(room.id);

    socket.to(room.id).emit('playerJoined', room);

    callback({
      success: true,
      data: room,
    });

    logger.info(`Player ${payload.playerName} joined room ${room.id} successfully`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to join room';
    logger.error(`Failed to join room: ${errorMessage}`);

    callback({
      success: false,
      error: errorMessage,
    });
  }
};
