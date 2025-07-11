import type {
  Map as GameMap,
  GameState,
  Player,
  Room,
  RoomSummary,
  SeekerPosition,
  UpdateSeekerPositionPayload,
} from '@hide-and-seek/shared';
import type { Server } from 'socket.io';
import { logger } from '@/utils/logger';
import { GameService } from './services/GameService';
import { SocketService } from './services/SocketService';
import { TimerService } from './services/TimerService';
import { generateRoomCode, generateRoomId } from './utils/gameUtils';
import {
  validateGameStart,
  validateHidingSpotSelection,
  validateHost,
  validateJoinRoom,
} from './utils/validationUtils';

class RoomManager {
  private rooms = new Map<string, Room>();
  private playerToRoom = new Map<string, string>();
  private roomCounter = 0;
  private gameStates = new Map<string, GameState>();
  private io: Server | null = null;
  private gameService = new GameService();
  private timerService = new TimerService();
  private socketService: SocketService | null = null;

  setSocketServer(io: Server): void {
    this.io = io;
    this.socketService = new SocketService(io);
  }

  generateRoomId(): string {
    this.roomCounter++;
    return generateRoomId(this.roomCounter);
  }

  generateRoomCode(): string {
    return generateRoomCode();
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

    validateJoinRoom(room, playerName);

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
      this.gameStates.delete(roomId);
      this.timerService.clearTimer(roomId);
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
    validateHost(host, hostSocketId);
    validateGameStart(room);

    room.status = 'hiding';

    const seeker = this.gameService.selectRandomSeeker(room);
    const gameState = this.gameService.initializeGameState(seeker.socketId);

    this.gameStates.set(roomId, gameState);
    this.startHidingPhase(roomId);

    logger.info(`Game started in room ${roomId} by ${host!.username}, seeker: ${seeker.username}`);
    return room;
  }

  selectHidingSpot(roomId: string, socketId: string, spotId: string): void {
    const room = this.rooms.get(roomId);
    const gameState = this.gameStates.get(roomId);

    if (!room || !gameState) {
      throw new Error('Room or game state not found');
    }

    validateHidingSpotSelection(gameState, socketId);

    const spot = room.map.hidingSpots.find((s) => s.id === spotId);
    if (!spot) {
      throw new Error('Hiding spot not found');
    }

    if (spot.isOccupied && spot.occupiedBy !== socketId) {
      throw new Error('Hiding spot already occupied');
    }

    this.gameService.clearPlayerFromSpots(room, socketId);

    spot.isOccupied = true;
    spot.occupiedBy = socketId;
    gameState.hiddenPlayers[socketId] = spotId;

    if (this.gameService.areAllPlayersHidden(room, gameState)) {
      this.endHidingPhase(roomId);
    }

    this.socketService?.emitGameStateUpdate(roomId, gameState);

    logger.info(`Player ${socketId} selected hiding spot ${spotId} in room ${roomId}`);
  }

  private startHidingPhase(roomId: string): void {
    const gameState = this.gameStates.get(roomId);
    if (!gameState) return;

    gameState.phase = 'hiding';
    gameState.timeLeft = 30000;
    gameState.phaseStartTime = Date.now();

    this.socketService?.emitGameStateUpdate(roomId, gameState);

    this.timerService.startHidingTimer(
      roomId,
      (timeLeft) => {
        gameState.timeLeft = timeLeft;
        this.socketService?.emitGameStateUpdate(roomId, gameState);
      },
      () => {
        this.endHidingPhase(roomId);
      },
    );
  }

  private endHidingPhase(roomId: string): void {
    const room = this.rooms.get(roomId);
    const gameState = this.gameStates.get(roomId);

    if (!room || !gameState) return;

    this.timerService.clearTimer(roomId);

    room.status = 'seeking';
    gameState.phase = 'seeking';
    gameState.timeLeft = 0;
    gameState.seekerPosition = { x: 0, y: 0 };

    this.socketService?.emitGameStateUpdate(roomId, gameState);

    logger.info(`Hiding phase ended in room ${roomId}, seeking phase started`);
  }

  updateSeekerPosition(roomId: string, payload: UpdateSeekerPositionPayload): void {
    const gameState = this.gameStates.get(roomId);
    if (!gameState) return;

    gameState.seekerPosition = { x: payload.x, y: payload.y };

    this.socketService?.emitSeekerMovement(roomId, gameState.seekerPosition);

    this.checkCollisionWithHidingSpots(roomId, gameState.seekerPosition);
  }

  private checkCollisionWithHidingSpots(roomId: string, seekerPosition: SeekerPosition): void {
    const room = this.rooms.get(roomId);
    const gameState = this.gameStates.get(roomId);

    if (!room || !gameState) return;

    for (const spot of room.map.hidingSpots) {
      if (
        this.gameService.isPositionInSpot(seekerPosition, spot) &&
        !this.gameService.isSpotAlreadyChecked(gameState, spot.id)
      ) {
        this.checkHidingSpot(roomId, spot.id);
        break;
      }
    }
  }

  private checkHidingSpot(roomId: string, spotId: string): void {
    const room = this.rooms.get(roomId);
    const gameState = this.gameStates.get(roomId);

    if (!room || !gameState) return;

    const spot = room.map.hidingSpots.find((s) => s.id === spotId);
    if (!spot) return;

    gameState.seekerAttempts++;
    gameState.checkedSpots.push(spotId);

    const hiddenPlayerSocketId = Object.keys(gameState.hiddenPlayers).find(
      (socketId) => gameState.hiddenPlayers[socketId] === spotId,
    );

    if (hiddenPlayerSocketId) {
      const foundPlayer = room.players.find((p) => p.socketId === hiddenPlayerSocketId);
      if (foundPlayer) {
        foundPlayer.isAlive = false;
        delete gameState.hiddenPlayers[hiddenPlayerSocketId];

        this.socketService?.emitPlayerFound(roomId, foundPlayer.username);

        logger.info(`Player ${foundPlayer.username} found in spot ${spotId} in room ${roomId}`);
      }
    }

    spot.isOccupied = false;
    delete spot.occupiedBy;

    const newPhase = this.gameService.checkGameEndConditions(room, gameState);
    if (newPhase) {
      this.endSeekingPhase(roomId, newPhase);
    }

    this.socketService?.emitGameStateUpdate(roomId, gameState);
  }

  private endSeekingPhase(roomId: string, newPhase?: 'ended' | 'results'): void {
    const room = this.rooms.get(roomId);
    const gameState = this.gameStates.get(roomId);

    if (!room || !gameState) return;

    if (newPhase) {
      gameState.phase = newPhase;
      room.status = newPhase;
    } else {
      const alivePlayers = room.players.filter((p) => p.isAlive && p.socketId !== gameState.seeker);

      if (alivePlayers.length === 1) {
        gameState.phase = 'ended';
        gameState.winner = alivePlayers[0] || null;
        room.status = 'ended';
      } else if (alivePlayers.length > 1) {
        gameState.phase = 'results';
        gameState.currentRound++;
        gameState.previousSeekers.push(gameState.seeker || '');
        room.status = 'results';
      } else {
        gameState.phase = 'ended';
        room.status = 'ended';
      }
    }

    this.socketService?.emitGameStateUpdate(roomId, gameState);

    logger.info(`Seeking phase ended in room ${roomId}, phase: ${gameState.phase}`);
  }

  getGameState(roomId: string): GameState | undefined {
    return this.gameStates.get(roomId);
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
    this.gameStates.clear();
    this.timerService.clearAllTimers();
    this.roomCounter = 0;
    logger.info('Room manager cleaned up');
  }
}

export const roomManager = new RoomManager();
