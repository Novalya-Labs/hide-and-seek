import type { FetchAvailableRoomsPayload, RoomSummary, SocketResponse } from '@hide-and-seek/shared';
import type { Socket } from 'socket.io';
import { logger } from '@/utils/logger';
import { roomManager } from '../roomManager';

export const handleFetchAvailableRooms = (
  _socket: Socket,
  _payload: FetchAvailableRoomsPayload,
  callback: (response: SocketResponse<RoomSummary[]>) => void,
): void => {
  try {
    logger.info('Fetching available rooms');

    const rooms = roomManager.getAvailableRooms();

    callback({
      success: true,
      data: rooms,
    });

    logger.info(`Returned ${rooms.length} available rooms`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch available rooms';
    logger.error(`Failed to fetch available rooms: ${errorMessage}`);

    callback({
      success: false,
      error: errorMessage,
    });
  }
};
