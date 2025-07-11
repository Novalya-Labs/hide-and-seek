import type { JoinRoomPayload, Room } from '@hide-and-seek/shared';
import { socketService } from '@/services/socket.service';

export const joinRoom = async (payload: JoinRoomPayload): Promise<Room> => {
  socketService.emit('joinRoom', payload);

  return { id: '1' };
};
