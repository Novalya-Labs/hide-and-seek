import type { ClientToServerEvents, ServerToClientEvents } from '@hide-and-seek/shared';
import type { Server, Socket as ServerSocket } from 'socket.io';
import type { InterServerEvents, SocketData } from '@/types/socket';
import { logger } from '@/utils/logger';
import {
  handleCreateRoom,
  handleFetchAvailableRooms,
  handleJoinRoom,
  handleJoinRoomWithCode,
  handleLeaveRoom,
  handleStartGame,
} from './events';
import { roomManager } from './roomManager';

type SocketServer = Server<ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData>;
type Socket = ServerSocket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function setupSocketHandlers(io: SocketServer) {
  logger.info('Setting up Socket.IO handlers');

  io.on('connection', (socket: Socket) => {
    const clientIP = socket.handshake.address;

    logger.info(`Client connected: ${socket.id} from ${clientIP}`);

    socket.on('createRoom', handleCreateRoom.bind(null, socket));
    socket.on('joinRoom', handleJoinRoom.bind(null, socket));
    socket.on('joinRoomWithCode', handleJoinRoomWithCode.bind(null, socket));
    socket.on('leaveRoom', handleLeaveRoom.bind(null, socket));
    socket.on('startGame', handleStartGame.bind(null, socket));
    socket.on('fetchAvailableRooms', handleFetchAvailableRooms.bind(null, socket));

    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id} from ${clientIP}, reason: ${reason}`);

      try {
        roomManager.leaveRoom(socket.id);
      } catch (error) {
        logger.error(`Error cleaning up disconnected player ${socket.id}:`, error);
      }
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  io.engine.on('connection_error', (err) => {
    logger.error('Socket.IO connection error:', err);
  });

  logger.info('Socket.IO handlers setup complete');
}
