import { createContext, type ReactNode, useContext, useEffect } from 'react';
import { Env } from '@/constants/Env';
import { useAuthStore } from '@/features/auth/authStore';
import { useRoomEvents } from '@/hooks/useRoomEvents';
import { socketService } from '@/services/socket.service';

interface WebSocketContextType {
  isConnected: boolean;
  isListeningToRoomEvents: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  isListeningToRoomEvents: false,
});

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const { isListening } = useRoomEvents();

  useEffect(() => {
    if (user && !user?.socketId) {
      socketService.connect(Env.WS_URL);
    }
  }, [user]);

  const payload: WebSocketContextType = {
    isConnected: !!user?.socketId,
    isListeningToRoomEvents: isListening,
  };

  return <WebSocketContext.Provider value={payload}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const { isConnected, isListeningToRoomEvents } = useContext(WebSocketContext);

  return {
    isConnected,
    isListeningToRoomEvents,
  };
};

export default WebSocketContext;
