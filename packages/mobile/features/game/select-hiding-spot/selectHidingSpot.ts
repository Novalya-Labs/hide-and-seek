import type { SelectHidingSpotPayload } from '@hide-and-seek/shared';
import { socketService } from '@/services/socket.service';

export const selectHidingSpot = async (payload: SelectHidingSpotPayload) => {
  return new Promise((resolve, reject) => {
    socketService.emitWithCallback('selectHidingSpot', payload, (response) => {
      if (response.success) {
        resolve(undefined);
      } else {
        reject(new Error(response.error || 'Failed to select hiding spot'));
      }
    });
  });
};
