import type { CreateRoomPayload, Room } from '@hide-and-seek/shared';
import { socketService } from '@/services/socket.service';

export const createRoom = async (payload: CreateRoomPayload): Promise<Room> => {
  return new Promise((resolve, reject) => {
    socketService.emitWithCallback('createRoom', payload, (response) => {
      if (response.success && response.data) {
        resolve(response.data);
      } else {
        reject(new Error(response.error || 'Failed to create room'));
      }
    });
  });
};
