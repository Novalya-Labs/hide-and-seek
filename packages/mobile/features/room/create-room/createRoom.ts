import type { CreateRoomPayload, Room } from '@hide-and-seek/shared';
import { socketService } from '@/services/socket.service';

export const createRoom = async (payload: CreateRoomPayload): Promise<Room> => {
  socketService.emit('createRoom', payload);

  return { id: '1' };
};
