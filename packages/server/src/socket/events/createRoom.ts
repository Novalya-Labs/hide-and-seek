import type { CreateRoomPayload, Room, SocketResponse } from '@hide-and-seek/shared';
import type { Socket } from 'socket.io';
import { getMapById } from '@/constants/maps';
import { logger } from '@/utils/logger';
import { roomManager } from '../roomManager';

export const handleCreateRoom = (
  socket: Socket,
  payload: CreateRoomPayload,
  callback: (response: SocketResponse<Room>) => void,
): void => {
  try {
    logger.info(`Creating room for player: ${payload.playerName}`);

    const map = getMapById(payload.mapId);
    if (!map) {
      callback({
        success: false,
        error: 'Invalid map ID',
      });
      return;
    }

    const room = roomManager.createRoom(
      socket.id,
      payload.playerName,
      payload.avatar,
      payload.maxPlayers,
      payload.isPrivate,
      map,
    );

    socket.join(room.id);

    socket.to(room.id).emit('roomUpdated', room);

    callback({
      success: true,
      data: room,
    });

    logger.info(`Room ${room.id} created successfully by ${payload.playerName}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create room';
    logger.error(`Failed to create room: ${errorMessage}`);

    callback({
      success: false,
      error: errorMessage,
    });
  }
};
