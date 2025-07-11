import type { LeaveRoomPayload, SocketResponse } from '@hide-and-seek/shared';
import type { Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { roomManager } from '../roomManager';

export const handleLeaveRoom = (
  socket: Socket,
  payload: LeaveRoomPayload,
  callback: (response: SocketResponse<void>) => void,
): void => {
  try {
    logger.info(`Player attempting to leave room ${payload.roomId}`);

    const { room, wasHost } = roomManager.leaveRoom(socket.id);

    if (room) {
      socket.leave(room.id);
      socket.to(room.id).emit('playerLeft', room);

      if (wasHost) {
        socket.to(room.id).emit('roomUpdated', room);
      }
    }

    callback({
      success: true,
    });

    logger.info(`Player left room ${payload.roomId} successfully`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to leave room';
    logger.error(`Failed to leave room: ${errorMessage}`);

    callback({
      success: false,
      error: errorMessage,
    });
  }
};
