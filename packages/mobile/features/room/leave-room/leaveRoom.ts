import type { LeaveRoomPayload } from '@hide-and-seek/shared';
import { socketService } from '@/services/socket.service';

export const leaveRoom = async (payload: LeaveRoomPayload): Promise<void> => {
  return new Promise((resolve, reject) => {
    socketService.emitWithCallback('leaveRoom', payload, (response) => {
      if (response.success) {
        resolve();
      } else {
        reject(new Error(response.error || 'Failed to leave room'));
      }
    });
  });
};
