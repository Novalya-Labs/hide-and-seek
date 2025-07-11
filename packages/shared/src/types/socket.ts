import type { GameState, SeekerPosition, SelectHidingSpotPayload, UpdateSeekerPositionPayload } from './game';
import type {
  CreateRoomPayload,
  FetchAvailableRoomsPayload,
  JoinRoomPayload,
  JoinRoomWithCodePayload,
  LeaveRoomPayload,
  Room,
  RoomSummary,
  StartGamePayload,
} from './room';

export type SocketResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type ServerToClientEvents = {
  roomUpdated: (room: Room) => void;
  playerJoined: (room: Room) => void;
  playerLeft: (room: Room) => void;
  gameStarted: (room: Room) => void;
  gameStateUpdated: (gameState: GameState) => void;
  seekerMovement: (position: SeekerPosition) => void;
  playerFound: (data: { username: string }) => void;
  error: (error: string) => void;
};

export type ClientToServerEvents = {
  fetchAvailableRooms: (
    payload: FetchAvailableRoomsPayload,
    callback: (response: SocketResponse<RoomSummary[]>) => void,
  ) => void;
  createRoom: (payload: CreateRoomPayload, callback: (response: SocketResponse<Room>) => void) => void;
  joinRoom: (payload: JoinRoomPayload, callback: (response: SocketResponse<Room>) => void) => void;
  joinRoomWithCode: (payload: JoinRoomWithCodePayload, callback: (response: SocketResponse<Room>) => void) => void;
  leaveRoom: (payload: LeaveRoomPayload, callback: (response: SocketResponse<void>) => void) => void;
  startGame: (payload: StartGamePayload, callback: (response: SocketResponse<Room>) => void) => void;
  selectHidingSpot: (payload: SelectHidingSpotPayload, callback: (response: SocketResponse<void>) => void) => void;
  updateSeekerPosition: (
    payload: UpdateSeekerPositionPayload,
    callback: (response: SocketResponse<void>) => void,
  ) => void;
};
