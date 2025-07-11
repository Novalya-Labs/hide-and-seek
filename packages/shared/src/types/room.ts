import { z } from 'zod';
import type { HidingSpot } from './game';

export const fetchAvailableRoomsSchema = z.object({});

export const createRoomSchema = z.object({
  playerName: z.string(),
  maxPlayers: z.number(),
  isPrivate: z.boolean(),
  mapId: z.string(),
  avatar: z.string(),
});

export const joinRoomSchema = z.object({
  roomId: z.string(),
  playerName: z.string(),
  avatar: z.string(),
});

export const joinRoomWithCodeSchema = z.object({
  code: z.string(),
  playerName: z.string(),
  avatar: z.string(),
});

export const leaveRoomSchema = z.object({
  roomId: z.string(),
});

export const startGameSchema = z.object({
  roomId: z.string(),
});

export type FetchAvailableRoomsPayload = z.infer<typeof fetchAvailableRoomsSchema>;
export type CreateRoomPayload = z.infer<typeof createRoomSchema>;
export type JoinRoomPayload = z.infer<typeof joinRoomSchema>;
export type JoinRoomWithCodePayload = z.infer<typeof joinRoomWithCodeSchema>;
export type LeaveRoomPayload = z.infer<typeof leaveRoomSchema>;
export type StartGamePayload = z.infer<typeof startGameSchema>;

export type Player = {
  id: string;
  username: string;
  avatar: string;
  socketId: string;
  isAlive: boolean;
  hidingSpot?: string;
  wasSeeker: boolean;
  isHost: boolean;
};

export type Map = {
  id: string;
  name: string;
  hidingSpots: HidingSpot[];
};

export type RoomStatus = 'waiting' | 'hiding' | 'seeking' | 'results' | 'ended';

export type Room = {
  id: string;
  code: string;
  players: Player[];
  map: Map;
  maxPlayers: number;
  isPrivate: boolean;
  status: RoomStatus;
};

export type RoomSummary = {
  id: string;
  mapName: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  isPrivate: boolean;
  mapId: string;
  status: RoomStatus;
};
