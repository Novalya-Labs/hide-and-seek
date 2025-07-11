import { z } from 'zod';
import type { User } from '../authTypes';

export const loginSchema = z.object({
  username: z.string(),
  avatar: z.string(),
});

export type LoginPayload = z.infer<typeof loginSchema>;

export const login = async (payload: LoginPayload): Promise<User | null> => {
  return {
    username: payload.username,
    avatar: payload.avatar,
  };
};
