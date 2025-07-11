import type { LeaveRoomPayload, Room } from '@hide-and-seek/shared';
import { socketService } from '@/services/socket.service';

export const leaveRoom = async (payload: LeaveRoomPayload): Promise<Room> => {
  socketService.emit('leaveRoom', payload);

  return { id: '1' };
};
