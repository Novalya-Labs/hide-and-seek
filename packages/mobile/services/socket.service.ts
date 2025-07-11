import type { ClientToServerEvents, ServerToClientEvents } from '@hide-and-seek/shared';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/features/auth/authStore';
import type { SocketConnectionStatus } from '@/types/socket';

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private connectionStatus: SocketConnectionStatus = {
    isConnected: false,
    isConnecting: false,
  };
  private listeners: Map<string, (status: SocketConnectionStatus) => void> = new Map();

  connect(serverUrl: string): void {
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
      if (this.socket?.id) {
        useAuthStore.getState().setSocketId(this.socket.id);
      }
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

  emitWithCallback<K extends keyof ClientToServerEvents>(event: K, ...args: Parameters<ClientToServerEvents[K]>): void {
    if (!this.socket?.connected) {
      const callback = args[args.length - 1] as (...args: unknown[]) => void;
      callback({ success: false, error: 'Socket not connected' });
      return;
    }

    this.socket.emit(event, ...args);
  }

  get socketOn() {
    if (!this.socket) {
      return () => {};
    }
    return this.socket.on.bind(this.socket);
  }

  get socketOff() {
    if (!this.socket) {
      return () => {};
    }
    return this.socket.off.bind(this.socket);
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
