import type {
  CreateRoomPayload,
  FetchAvailableRoomsPayload,
  JoinRoomPayload,
  JoinRoomWithCodePayload,
  LeaveRoomPayload,
  Room,
  RoomSummary,
  StartGamePayload,
} from '@hide-and-seek/shared';

export interface RoomState {
  currentRoom: Room | null;
  availableRooms: RoomSummary[];
  isFetching: boolean;
  isCreating: boolean;
  isJoining: boolean;
  isLeaving: boolean;
  isStarting: boolean;
  error: string | null;
}

export interface RoomStore extends RoomState {
  fetchAvailableRooms: (payload: FetchAvailableRoomsPayload) => Promise<void>;
  createRoom: (payload: CreateRoomPayload) => Promise<void>;
  joinRoom: (payload: JoinRoomPayload) => Promise<void>;
  joinRoomWithCode: (payload: JoinRoomWithCodePayload) => Promise<void>;
  leaveRoom: (payload: LeaveRoomPayload) => Promise<void>;
  startGame: (payload: StartGamePayload) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}
