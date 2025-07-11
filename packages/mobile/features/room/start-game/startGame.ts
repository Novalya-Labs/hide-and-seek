import type { Room, StartGamePayload } from '@hide-and-seek/shared';
import { socketService } from '@/services/socket.service';

export const startGame = async (payload: StartGamePayload): Promise<Room> => {
  socketService.emit('startGame', payload);

  return { id: '1' };
};
