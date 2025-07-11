import type { JoinRoomWithCodePayload, Room } from '@hide-and-seek/shared';
import { socketService } from '@/services/socket.service';

export const joinRoomWithCode = async (payload: JoinRoomWithCodePayload): Promise<Room> => {
  return new Promise((resolve, reject) => {
    socketService.emitWithCallback('joinRoomWithCode', payload, (response) => {
      if (response.success && response.data) {
        resolve(response.data);
      } else {
        reject(new Error(response.error || 'Failed to join room with code'));
      }
    });
  });
};
