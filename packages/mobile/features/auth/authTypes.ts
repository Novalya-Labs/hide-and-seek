import type { LoginPayload } from './login/login';

export type Theme = 'light' | 'dark' | 'system';

export type User = {
  username: string;
  avatar: string;
  socketId?: string;
};

export interface AuthState {
  user: User | null;
  theme: Theme;
  loading: boolean;
}

export type AuthStore = AuthState & {
  login: (payload: LoginPayload) => Promise<void>;
  setSocketId: (socketId: string) => void;
  setTheme: (theme: Theme) => void;
  reset: () => void;
};
