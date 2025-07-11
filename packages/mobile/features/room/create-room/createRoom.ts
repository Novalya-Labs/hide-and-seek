import type { CreateRoomPayload, Room } from '@hide-and-seek/shared';
import { MAPS } from '@/constants/Maps';
import { getHidingSpots } from '@/lib/get-hiding-spots';
import { socketService } from '@/services/socket.service';

export const createRoom = async (payload: CreateRoomPayload): Promise<Room> => {
  socketService.emit('createRoom', payload);

  return {
    id: '1',
    code: '123456',
    players: [],
    map: {
      id: payload.mapId,
      name: MAPS.find((map) => map.id === payload.mapId)?.name || 'Map 1',
      hidingSpots: getHidingSpots(payload.mapId),
    },
    maxPlayers: payload.maxPlayers,
    isPrivate: payload.isPrivate,
    status: 'waiting',
  };
};
