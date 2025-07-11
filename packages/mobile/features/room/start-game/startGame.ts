import type { Room, StartGamePayload } from '@hide-and-seek/shared';
import { socketService } from '@/services/socket.service';

export const startGame = async (payload: StartGamePayload): Promise<Room> => {
  return new Promise((resolve, reject) => {
    socketService.emitWithCallback('startGame', payload, (response) => {
      if (response.success && response.data) {
        resolve(response.data);
      } else {
        reject(new Error(response.error || 'Failed to start game'));
      }
    });
  });
};
