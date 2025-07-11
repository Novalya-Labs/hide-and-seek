import type { ClientToServerEvents, ServerToClientEvents } from '@hide-and-seek/shared';
import { io, type Socket } from 'socket.io-client';
import { Env } from '@/constants/Env';
import type { SocketConnectionStatus } from '@/types/socket';

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private connectionStatus: SocketConnectionStatus = {
    isConnected: false,
    isConnecting: false,
  };
  private listeners: Map<string, (status: SocketConnectionStatus) => void> = new Map();

  connect(serverUrl: string = Env.WS_URL): void {
    if (this.socket?.connected) {
      return;
    }

    this.updateConnectionStatus({ isConnecting: true, isConnected: false });

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 15000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      forceNew: true,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      this.updateConnectionStatus({ isConnected: true, isConnecting: false });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.updateConnectionStatus({
        isConnected: false,
        isConnecting: false,
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.updateConnectionStatus({
        isConnected: false,
        isConnecting: false,
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.updateConnectionStatus({ isConnected: false, isConnecting: false });
    }
  }

  emit<T extends keyof ClientToServerEvents>(event: T, ...args: Parameters<ClientToServerEvents[T]>): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit(event, ...args);
  }

  on<T extends keyof ServerToClientEvents>(event: T, callback: ServerToClientEvents[T]): void {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }
    // biome-ignore lint/suspicious/noExplicitAny: <Wait>
    this.socket.on(event, callback as any);
  }

  off<T extends keyof ServerToClientEvents>(event: T, callback?: ServerToClientEvents[T]): void {
    if (!this.socket) {
      return;
    }
    // biome-ignore lint/suspicious/noExplicitAny: <Wait>
    this.socket.off(event, callback as any);
  }

  onConnectionStatusChange(id: string, callback: (status: SocketConnectionStatus) => void): void {
    this.listeners.set(id, callback);
    callback(this.connectionStatus);
  }

  offConnectionStatusChange(id: string): void {
    this.listeners.delete(id);
  }

  getConnectionStatus(): SocketConnectionStatus {
    return { ...this.connectionStatus };
  }

  getConnectionId(): string | null {
    return this.socket?.id ?? null;
  }

  private updateConnectionStatus(status: Partial<SocketConnectionStatus>): void {
    this.connectionStatus = { ...this.connectionStatus, ...status };
    this.listeners.forEach((callback) => callback(this.connectionStatus));
  }
}

export const socketService = new SocketService();
