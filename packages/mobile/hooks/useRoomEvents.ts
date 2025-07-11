import type { Room } from '@hide-and-seek/shared';
import { useEffect } from 'react';
import { useRoomStore } from '@/features/room/roomStore';
import { socketService } from '@/services/socket.service';

export const useRoomEvents = () => {
  const { currentRoom } = useRoomStore();

  useEffect(() => {
    if (!currentRoom) return;

    const handlePlayerJoined = (room: Room) => {
      console.log('Player joined event received:', room);
      useRoomStore.setState({ currentRoom: room });
    };

    const handlePlayerLeft = (room: Room) => {
      console.log('Player left event received:', room);
      useRoomStore.setState({ currentRoom: room });
    };

    const handleRoomUpdated = (room: Room) => {
      console.log('Room updated event received:', room);
      useRoomStore.setState({ currentRoom: room });
    };

    const handleGameStarted = (room: Room) => {
      console.log('Game started event received:', room);
      useRoomStore.setState({ currentRoom: room });
    };

    const handleError = (error: string) => {
      console.error('Socket error received:', error);
      useRoomStore.setState({ error });
    };

    socketService.socketOn('playerJoined', handlePlayerJoined);
    socketService.socketOn('playerLeft', handlePlayerLeft);
    socketService.socketOn('roomUpdated', handleRoomUpdated);
    socketService.socketOn('gameStarted', handleGameStarted);
    socketService.socketOn('error', handleError);

    return () => {
      socketService.socketOff('playerJoined', handlePlayerJoined);
      socketService.socketOff('playerLeft', handlePlayerLeft);
      socketService.socketOff('roomUpdated', handleRoomUpdated);
      socketService.socketOff('gameStarted', handleGameStarted);
      socketService.socketOff('error', handleError);
    };
  }, [currentRoom]);

  return {
    isListening: !!currentRoom,
  };
};
