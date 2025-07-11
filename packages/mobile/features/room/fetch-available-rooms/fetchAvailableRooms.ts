import type { FetchAvailableRoomsPayload, RoomSummary } from '@hide-and-seek/shared';
import { socketService } from '@/services/socket.service';

export const fetchAvailableRooms = async (payload: FetchAvailableRoomsPayload): Promise<RoomSummary[]> => {
  socketService.emit('fetchAvailableRooms', payload);
  return [];
};
