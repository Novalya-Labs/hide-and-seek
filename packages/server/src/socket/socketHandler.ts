import type { ClientToServerEvents, ServerToClientEvents } from '@hide-and-seek/shared';
import type { Server } from 'socket.io';
import type { InterServerEvents, SocketData } from '@/types/socket';
import { logger } from '../utils/logger';

type SocketServer = Server<ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData>;

export function setupSocketHandlers(io: SocketServer) {
  logger.info('Setting up Socket.IO handlers');

  io.on('connection', (socket) => {
    const clientIP = socket.handshake.address;

    logger.info(`Client connected: ${socket.id} from ${clientIP}`);

    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id} from ${clientIP}, reason: ${reason}`);
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
