import type {
  CreateRoomPayload,
  FetchAvailableRoomsPayload,
  JoinRoomPayload,
  JoinRoomWithCodePayload,
  LeaveRoomPayload,
  StartGamePayload,
} from './room';

export type ServerToClientEvents = {
  availableRooms: () => void;
};

export type ClientToServerEvents = {
  fetchAvailableRooms: (payload: FetchAvailableRoomsPayload) => void;
  createRoom: (payload: CreateRoomPayload) => void;
  joinRoom: (payload: JoinRoomPayload) => void;
  joinRoomWithCode: (payload: JoinRoomWithCodePayload) => void;
  leaveRoom: (payload: LeaveRoomPayload) => void;
  startGame: (payload: StartGamePayload) => void;
};
