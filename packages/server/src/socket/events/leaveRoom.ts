import type { LeaveRoomPayload, SocketResponse } from '@hide-and-seek/shared';
import type { Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { roomManager } from '../roomManager';

export const handleLeaveRoom = async (
  socket: Socket,
  payload: LeaveRoomPayload,
  callback: (response: SocketResponse<void>) => void,
): Promise<void> => {
  try {
    logger.info(`Player attempting to leave room ${payload.roomId}`);

    const { room, wasHost } = roomManager.leaveRoom(socket.id);

    if (room) {
      socket.leave(room.id);

      if (wasHost && (room.status === 'hiding' || room.status === 'seeking')) {
        socket.to(room.id).emit('error', 'Host left the game. You have been disconnected.');

        const roomSockets = await socket.nsp.in(room.id).fetchSockets();
        for (const roomSocket of roomSockets) {
          roomSocket.leave(room.id);
        }

        logger.info(`Room ${room.id} closed due to host leaving during game`);
      } else {
        socket.to(room.id).emit('playerLeft', room);

        if (wasHost && room.players.length > 0) {
          socket.to(room.id).emit('roomUpdated', room);
          logger.info(`Host transferred in room ${room.id} due to intentional leave`);
        }
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
