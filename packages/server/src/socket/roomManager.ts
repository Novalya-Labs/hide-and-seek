import type { Map as GameMap, Player, Room, RoomSummary } from '@hide-and-seek/shared';
import { logger } from '@/utils/logger';

class RoomManager {
  private rooms = new Map<string, Room>();
  private playerToRoom = new Map<string, string>();
  private roomCounter = 0;

  generateRoomId(): string {
    this.roomCounter++;
    return `room_${this.roomCounter}_${Date.now()}`;
  }

  generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  createRoom(
    hostSocketId: string,
    playerName: string,
    avatar: string,
    maxPlayers: number,
    isPrivate: boolean,
    map: GameMap,
  ): Room {
    const roomId = this.generateRoomId();
    const roomCode = this.generateRoomCode();

    const hostPlayer: Player = {
      id: hostSocketId,
      username: playerName,
      avatar,
      socketId: hostSocketId,
      isAlive: true,
      wasSeeker: false,
      isHost: true,
    };

    const room: Room = {
      id: roomId,
      code: roomCode,
      players: [hostPlayer],
      map,
      maxPlayers,
      isPrivate,
      status: 'waiting',
    };

    this.rooms.set(roomId, room);
    this.playerToRoom.set(hostSocketId, roomId);

    logger.info(`Room created: ${roomId} by ${playerName}`);
    return room;
  }

  joinRoom(roomId: string, socketId: string, playerName: string, avatar: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    if (room.players.length >= room.maxPlayers) {
      throw new Error('Room is full');
    }

    if (room.status !== 'waiting') {
      throw new Error('Room is not accepting new players');
    }

    const existingPlayer = room.players.find((p) => p.username === playerName);
    if (existingPlayer) {
      throw new Error('Player name already taken in this room');
    }

    const newPlayer: Player = {
      id: socketId,
      username: playerName,
      avatar,
      socketId,
      isAlive: true,
      wasSeeker: false,
      isHost: false,
    };

    room.players.push(newPlayer);
    this.playerToRoom.set(socketId, roomId);

    logger.info(`Player ${playerName} joined room ${roomId}`);
    return room;
  }

  joinRoomWithCode(code: string, socketId: string, playerName: string, avatar: string): Room | null {
    const room = Array.from(this.rooms.values()).find((r) => r.code === code);
    if (!room) {
      return null;
    }

    return this.joinRoom(room.id, socketId, playerName, avatar);
  }

  leaveRoom(socketId: string): { room: Room | null; wasHost: boolean } {
    const roomId = this.playerToRoom.get(socketId);
    if (!roomId) {
      return { room: null, wasHost: false };
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      this.playerToRoom.delete(socketId);
      return { room: null, wasHost: false };
    }

    const playerIndex = room.players.findIndex((p) => p.socketId === socketId);
    if (playerIndex === -1) {
      return { room: null, wasHost: false };
    }

    const player = room.players[playerIndex];
    if (!player) {
      return { room: null, wasHost: false };
    }

    const wasHost = player.isHost;

    room.players.splice(playerIndex, 1);
    this.playerToRoom.delete(socketId);

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      logger.info(`Room ${roomId} deleted (no players left)`);
      return { room: null, wasHost };
    }

    if (wasHost && room.players.length > 0) {
      const newHost = room.players[0];
      if (newHost) {
        newHost.isHost = true;
        logger.info(`Host transferred to ${newHost.username} in room ${roomId}`);
      }
    }

    logger.info(`Player ${player.username} left room ${roomId}`);
    return { room, wasHost };
  }

  startGame(roomId: string, hostSocketId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    const host = room.players.find((p) => p.socketId === hostSocketId && p.isHost);
    if (!host) {
      throw new Error('Only the host can start the game');
    }

    if (room.players.length < 2) {
      throw new Error('Need at least 2 players to start the game');
    }

    if (room.status !== 'waiting') {
      throw new Error('Game has already started');
    }

    room.status = 'hiding';
    logger.info(`Game started in room ${roomId} by ${host.username}`);
    return room;
  }

  getAvailableRooms(): RoomSummary[] {
    return Array.from(this.rooms.values())
      .filter((room) => !room.isPrivate && room.status === 'waiting')
      .map((room) => ({
        id: room.id,
        mapName: room.map.name,
        hostName: room.players.find((p) => p.isHost)?.username || 'Unknown',
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        isPrivate: room.isPrivate,
        mapId: room.map.id,
        status: room.status,
      }));
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomBySocketId(socketId: string): Room | undefined {
    const roomId = this.playerToRoom.get(socketId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  cleanup() {
    this.rooms.clear();
    this.playerToRoom.clear();
    this.roomCounter = 0;
    logger.info('Room manager cleaned up');
  }
}

export const roomManager = new RoomManager();
