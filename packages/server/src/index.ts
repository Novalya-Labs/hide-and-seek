import { createServer as createHttpServer } from 'node:http';
import type { ClientToServerEvents, ServerToClientEvents } from '@hide-and-seek/shared';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import type { InterServerEvents, SocketData } from '@/types/socket';
import { setupSocketHandlers } from './socket/socketHandler';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    logger.info('Starting Hide And Seek server...');

    const app = express();
    const server = createHttpServer(app);

    app.use(
      cors({
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );

    app.use(express.json());

    app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
      cors: {
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    setupSocketHandlers(io);

    logger.info('Server created successfully');

    server.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(`Hide And Seek server running on port ${PORT}`);
      logger.info('Socket.IO server is ready');
      logger.info(`Server accessible at: http://localhost:${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    process.on('SIGINT', () => {
      logger.info('Shutting down server...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      logger.info('Shutting down server...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
