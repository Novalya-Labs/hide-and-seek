import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Animated, Dimensions, Image, SafeAreaView, StyleSheet, View } from 'react-native';
import {
  GameHidingSpot,
  GameInfoCard,
  GameMapOverlay,
  GamePhaseHeader,
  GameResults,
  PlayerCard,
  SeekerCursor,
} from '@/components/game';
import { Button, LoadingSpinner, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/authStore';
import { useGameStore } from '@/features/game/gameStore';
import { useRoomStore } from '@/features/room/roomStore';
import { useGameAnimations } from '@/hooks/useGameAnimations';
import { useGameProximity } from '@/hooks/useGameProximity';
import { useGameTimer } from '@/hooks/useGameTimer';
import { getMapImageSource } from '@/lib/get-map-source';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function GameScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentRoom, leaveRoom } = useRoomStore();
  const { selectHidingSpot, gameState, error, clearError, seekerActions, getCurrentTimeLeft } = useGameStore();

  const [isPerformingAction, setIsPerformingAction] = useState(false);

  const getSeekerUsername = useCallback((): string | null => {
    if (!gameState.seeker || !currentRoom) return null;

    const seekerPlayer = currentRoom.players.find((p) => p.socketId === gameState.seeker);
    return seekerPlayer ? seekerPlayer.username : null;
  }, [gameState.seeker, currentRoom]);

  const getSeekerAvatar = useCallback((): string | null => {
    if (!gameState.seeker || !currentRoom) return null;

    const seekerPlayer = currentRoom.players.find((p) => p.socketId === gameState.seeker);
    return seekerPlayer ? seekerPlayer.avatar : null;
  }, [gameState.seeker, currentRoom]);

  const isCurrentPlayerSeeker = useCallback((): boolean => {
    if (!user?.socketId) return false;
    return gameState.seeker === user.socketId;
  }, [user?.socketId, gameState.seeker]);

  const { pulseAnim, heartbeatAnim, phaseAnim, roleAnim } = useGameAnimations({
    gamePhase: gameState.phase,
    isCurrentPlayerSeeker,
  });

  const { currentTimeLeft } = useGameTimer({
    gamePhase: gameState.phase,
    gameTimeLeft: gameState.timeLeft,
    getCurrentTimeLeft,
  });

  const getCurrentPlayerHidingSpot = useCallback((): string | null => {
    if (!user?.socketId) return null;
    return gameState.hiddenPlayers[user.socketId] || null;
  }, [user?.socketId, gameState.hiddenPlayers]);

  const isSpotChecked = useCallback(
    (spotId: string): boolean => {
      return gameState.seekerAttempts > 0 && seekerActions[spotId] !== undefined;
    },
    [gameState.seekerAttempts, seekerActions],
  );

  const areAllHidersReady = useCallback((): boolean => {
    if (!currentRoom) return false;

    const totalHiders = currentRoom.players.filter((p) => p.isAlive && p.socketId !== gameState.seeker).length;
    const hiddenPlayersCount = Object.keys(gameState.hiddenPlayers).length;

    return totalHiders > 0 && hiddenPlayersCount === totalHiders;
  }, [currentRoom, gameState.seeker, gameState.hiddenPlayers]);

  const shouldShowMapOverlay = useCallback((): boolean => {
    return gameState.phase === 'hiding' && areAllHidersReady() && !isCurrentPlayerSeeker();
  }, [gameState.phase, areAllHidersReady, isCurrentPlayerSeeker]);

  const calculateDistance = useCallback((x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }, []);

  const getSeekerProximity = useCallback((): number => {
    if (!gameState.seekerPosition || !currentRoom) return 0;

    const currentPlayerSpot = getCurrentPlayerHidingSpot();
    if (!currentPlayerSpot) return 0;

    const hidingSpot = currentRoom.map.hidingSpots.find((spot) => spot.id === currentPlayerSpot);
    if (!hidingSpot) return 0;

    const spotCenterX = hidingSpot.x + hidingSpot.width / 2;
    const spotCenterY = hidingSpot.y + hidingSpot.height / 2;

    const distance = calculateDistance(
      gameState.seekerPosition.x,
      gameState.seekerPosition.y,
      spotCenterX,
      spotCenterY,
    );

    const maxDistance = 400;
    return Math.max(0, 1 - distance / maxDistance);
  }, [gameState.seekerPosition, currentRoom, getCurrentPlayerHidingSpot, calculateDistance]);

  useGameProximity({
    gamePhase: gameState.phase,
    isCurrentPlayerSeeker,
    getSeekerProximity,
  });

  const handleLeaveGame = async () => {
    if (!currentRoom) return;

    Alert.alert('Leave Game', 'Are you sure you want to leave the game?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveRoom({ roomId: currentRoom.id });
            router.replace('/lobby');
          } catch {
            Alert.alert('Error', 'Failed to leave game');
          }
        },
      },
    ]);
  };

  const handleSpotPress = async (spotId: string) => {
    if (!currentRoom || isPerformingAction) return;

    const gamePhase = gameState.phase;
    const isSeeker = isCurrentPlayerSeeker();

    if (gamePhase === 'hiding' && !isSeeker) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        console.log('Haptics not available');
      }

      setIsPerformingAction(true);
      try {
        await selectHidingSpot({ spotId });
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          console.log('Haptics not available');
        }
      } catch (error) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch {
          console.log('Haptics not available');
        }
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to select hiding spot');
      } finally {
        setIsPerformingAction(false);
      }
    }
  };

  const renderGamePhase = () => {
    if (!currentRoom) return null;

    const phase = gameState.phase;

    if (phase === 'results' || phase === 'ended') {
      return (
        <GameResults
          currentRoom={currentRoom}
          gameState={gameState}
          user={user}
          getSeekerUsername={getSeekerUsername}
        />
      );
    }

    return (
      <View style={styles.gameContainer}>
        <View style={styles.mapContainer}>
          <Animated.View
            style={[
              styles.mapImageContainer,
              gameState.phase === 'seeking' && !isCurrentPlayerSeeker()
                ? { transform: [{ scale: heartbeatAnim }] }
                : {},
            ]}
          >
            <Image source={getMapImageSource(currentRoom.map.id)} style={styles.mapImage} resizeMode="contain" />
          </Animated.View>

          <GameMapOverlay shouldShowMapOverlay={shouldShowMapOverlay} />

          {currentRoom.map.hidingSpots.map((spot) => (
            <GameHidingSpot
              key={spot.id}
              spot={spot}
              gameState={gameState}
              isCurrentPlayerSeeker={isCurrentPlayerSeeker}
              getCurrentPlayerHidingSpot={getCurrentPlayerHidingSpot}
              isSpotChecked={isSpotChecked}
              getSeekerProximity={getSeekerProximity}
              handleSpotPress={handleSpotPress}
              isPerformingAction={isPerformingAction}
              pulseAnim={pulseAnim}
            />
          ))}

          {phase === 'seeking' && getSeekerAvatar() && (
            <SeekerCursor
              seekerAvatar={getSeekerAvatar()!}
              mapWidth={800}
              mapHeight={600}
              isCurrentSeeker={isCurrentPlayerSeeker()}
              containerWidth={screenWidth * 0.9}
              containerHeight={screenHeight * 0.4}
            />
          )}
        </View>

        <View style={styles.playersContainer}>
          <View style={styles.playersGrid}>
            {currentRoom.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isCurrentPlayer={player.username === user?.username}
                isSeeker={player.username === getSeekerUsername()}
                gamePhase={phase}
              />
            ))}
          </View>
        </View>
      </View>
    );
  };

  if (!currentRoom) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner visible text="Loading game..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{currentRoom?.map.name}</Text>
          <Text style={styles.headerSubtitle}>Round {gameState.currentRound}</Text>
        </View>

        <Button label="Leave" onPress={handleLeaveGame} variant="destructive" size="small" />
      </View>
      <GameInfoCard gameState={gameState} getSeekerUsername={getSeekerUsername} />

      <GamePhaseHeader
        currentRoom={currentRoom}
        gameState={gameState}
        isCurrentPlayerSeeker={isCurrentPlayerSeeker}
        currentTimeLeft={currentTimeLeft}
        phaseAnim={phaseAnim}
        roleAnim={roleAnim}
      />

      <View style={styles.contentContainer}>{renderGamePhase()}</View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button label="Dismiss" onPress={clearError} variant="outline" size="small" />
        </View>
      )}

      <LoadingSpinner visible={isPerformingAction} overlay text="Processing..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
  },

  gameContainer: {
    flex: 1,
  },

  mapContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },

  mapImageContainer: {
    width: '100%',
    height: '100%',
  },

  mapImage: {
    width: '100%',
    height: '100%',
  },

  playersContainer: {
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },

  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  errorContainer: {
    backgroundColor: '#F8D7DA',
    borderColor: '#F5C6CB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    margin: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  errorText: {
    color: '#721C24',
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },

  contentContainer: {
    flex: 1,
  },
});
