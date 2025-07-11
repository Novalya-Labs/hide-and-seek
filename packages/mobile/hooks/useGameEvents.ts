import type { GameState, SeekerPosition } from '@hide-and-seek/shared';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { useGameStore } from '@/features/game/gameStore';
import { useRoomStore } from '@/features/room/roomStore';
import { notificationService } from '@/lib/notify';
import { socketService } from '@/services/socket.service';

export const useGameEvents = () => {
  const { currentRoom } = useRoomStore();
  const { gameState, updateSeekerPosition } = useGameStore();

  useEffect(() => {
    if (!currentRoom || currentRoom.status === 'waiting') return;

    const handleGameStateUpdated = (newGameState: GameState) => {
      console.log('Game state updated event received:', newGameState);
      useGameStore.setState({ gameState: newGameState });
    };

    const handleSeekerMovement = (position: SeekerPosition) => {
      console.log('Seeker movement event received:', position);
      updateSeekerPosition(position);
    };

    const handlePlayerFound = async (data: { username: string }) => {
      console.log('Player found event received:', data);

      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        await notificationService.notify({
          type: 'success',
          message: `${data.username} found!`,
          duration: 3000,
        });
      } catch (error) {
        console.error('Error showing player found notification:', error);
      }
    };

    const handleError = (error: string) => {
      console.error('Game socket error received:', error);
      useGameStore.setState({ error });
    };

    socketService.socketOn('gameStateUpdated', handleGameStateUpdated);
    socketService.socketOn('seekerMovement', handleSeekerMovement);
    socketService.socketOn('playerFound', handlePlayerFound);
    socketService.socketOn('error', handleError);

    return () => {
      socketService.socketOff('gameStateUpdated', handleGameStateUpdated);
      socketService.socketOff('seekerMovement', handleSeekerMovement);
      socketService.socketOff('playerFound', handlePlayerFound);
      socketService.socketOff('error', handleError);
    };
  }, [currentRoom, updateSeekerPosition]);

  return {
    isListening: !!currentRoom && currentRoom.status !== 'waiting',
    gamePhase: gameState.phase,
    isGameActive: currentRoom?.status === 'hiding' || currentRoom?.status === 'seeking',
  };
};
