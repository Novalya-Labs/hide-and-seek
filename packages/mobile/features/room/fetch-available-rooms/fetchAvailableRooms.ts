import type { FetchAvailableRoomsPayload, RoomSummary } from '@hide-and-seek/shared';
import { socketService } from '@/services/socket.service';

export const fetchAvailableRooms = async (payload: FetchAvailableRoomsPayload): Promise<RoomSummary[]> => {
  return new Promise((resolve, reject) => {
    socketService.emitWithCallback('fetchAvailableRooms', payload, (response) => {
      if (response.success && response.data) {
        resolve(response.data);
      } else {
        reject(new Error(response.error || 'Failed to fetch available rooms'));
      }
    });
  });
};
