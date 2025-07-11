import { z } from 'zod';
import { socketService } from '@/services/socket.service';
import type { User } from '../authTypes';

export const loginSchema = z.object({
  username: z.string(),
  avatar: z.string(),
});

export type LoginPayload = z.infer<typeof loginSchema>;

export const login = async (payload: LoginPayload): Promise<User | null> => {
  const socketId = socketService.getConnectionStatus().isConnected ? socketService.getConnectionId() : null;

  if (!socketId) {
    throw new Error('No socket connection');
  }

  return {
    username: payload.username,
    avatar: payload.avatar,
    socketId,
  };
};
