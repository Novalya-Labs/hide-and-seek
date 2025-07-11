import type { JoinRoomWithCodePayload, Room } from '@hide-and-seek/shared';
import { socketService } from '@/services/socket.service';

export const joinRoomWithCode = async (payload: JoinRoomWithCodePayload): Promise<Room> => {
  socketService.emit('joinRoomWithCode', payload);

  return { id: '1' };
};
