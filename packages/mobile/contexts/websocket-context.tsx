import { createContext, type ReactNode, useContext, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/authStore';
import { socketService } from '@/services/socket.service';

interface WebSocketContextType {
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
});

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      socketService.connect();
    }
  }, [user]);

  const payload: WebSocketContextType = {
    isConnected: !!user,
  };

  return <WebSocketContext.Provider value={payload}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const { isConnected } = useContext(WebSocketContext);

  return {
    isConnected,
  };
};

export default WebSocketContext;
