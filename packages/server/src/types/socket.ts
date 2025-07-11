export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  playerId?: string;
  playerName?: string;
  roomId?: string;
}
