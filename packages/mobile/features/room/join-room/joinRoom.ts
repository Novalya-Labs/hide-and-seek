import type { JoinRoomPayload, Room } from '@hide-and-seek/shared';
import { socketService } from '@/services/socket.service';

export const joinRoom = async (payload: JoinRoomPayload): Promise<Room> => {
  return new Promise((resolve, reject) => {
    socketService.emitWithCallback('joinRoom', payload, (response) => {
      if (response.success && response.data) {
        resolve(response.data);
      } else {
        reject(new Error(response.error || 'Failed to join room'));
      }
    });
  });
};
