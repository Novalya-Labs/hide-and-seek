import type { SelectHidingSpotPayload, SocketResponse } from '@hide-and-seek/shared';
import type { Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { roomManager } from '../roomManager';

export const handleSelectHidingSpot = (
  socket: Socket,
  payload: SelectHidingSpotPayload,
  callback: (response: SocketResponse<void>) => void,
): void => {
  try {
    logger.info(`Player ${socket.id} selecting hiding spot ${payload.spotId}`);

    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) {
      callback({
        success: false,
        error: 'Room not found',
      });
      return;
    }

    roomManager.selectHidingSpot(room.id, socket.id, payload.spotId);

    callback({
      success: true,
    });

    logger.info(`Player ${socket.id} selected hiding spot ${payload.spotId} successfully`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to select hiding spot';
    logger.error(`Failed to select hiding spot: ${errorMessage}`);

    callback({
      success: false,
      error: errorMessage,
    });
  }
};
