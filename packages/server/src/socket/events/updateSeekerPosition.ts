import type { SocketResponse, UpdateSeekerPositionPayload } from '@hide-and-seek/shared';
import type { Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { roomManager } from '../roomManager';

export const handleUpdateSeekerPosition = (
  socket: Socket,
  payload: UpdateSeekerPositionPayload,
  callback: (response: SocketResponse<void>) => void,
): void => {
  try {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) {
      callback({
        success: false,
        error: 'Room not found',
      });
      return;
    }

    const gameState = roomManager.getGameState(room.id);
    if (!gameState) {
      callback({
        success: false,
        error: 'Game state not found',
      });
      return;
    }

    if (gameState.phase !== 'seeking') {
      callback({
        success: false,
        error: 'Not in seeking phase',
      });
      return;
    }

    if (gameState.seeker !== socket.id) {
      callback({
        success: false,
        error: 'Only seeker can update position',
      });
      return;
    }

    roomManager.updateSeekerPosition(room.id, payload);

    callback({
      success: true,
    });

    logger.debug(`Seeker position updated in room ${room.id}: x=${payload.x}, y=${payload.y}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update seeker position';
    logger.error(`Failed to update seeker position: ${errorMessage}`);

    callback({
      success: false,
      error: errorMessage,
    });
  }
};
