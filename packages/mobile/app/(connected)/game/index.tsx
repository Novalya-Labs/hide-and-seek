import type { HidingSpot } from '@hide-and-seek/shared';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Image, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { PlayerCard, SeekerCursor } from '@/components/game';
import { Button, LoadingSpinner, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/authStore';
import { useGameStore } from '@/features/game/gameStore';
import { useRoomStore } from '@/features/room/roomStore';
import { getMapImageSource } from '@/lib/get-map-source';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function GameScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentRoom, leaveRoom } = useRoomStore();
  const { selectHidingSpot, gameState, error, clearError, seekerActions, getCurrentTimeLeft } = useGameStore();

  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [currentTimeLeft, setCurrentTimeLeft] = useState(0);

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

  useEffect(() => {
    if (gameState.phase === 'hiding' && gameState.timeLeft > 0) {
      const interval = setInterval(() => {
        const remaining = getCurrentTimeLeft();
        setCurrentTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
    setCurrentTimeLeft(0);
  }, [gameState.phase, gameState.timeLeft, getCurrentTimeLeft]);

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
      setIsPerformingAction(true);
      try {
        await selectHidingSpot({ spotId });
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to select hiding spot');
      } finally {
        setIsPerformingAction(false);
      }
    }
  };

  const renderHidingSpot = (spot: HidingSpot) => {
    const gamePhase = gameState.phase;
    const isSeeker = isCurrentPlayerSeeker();
    const currentPlayerSpot = getCurrentPlayerHidingSpot();
    const isMySpot = currentPlayerSpot === spot.id;
    const isChecked = isSpotChecked(spot.id);

    let spotColor = '#007AFF';
    let spotOpacity = 0.7;

    if (gamePhase === 'hiding') {
      if (spot.isOccupied && !isSeeker) {
        spotColor = isMySpot ? '#28A745' : '#DC3545';
      } else if (isMySpot) {
        spotColor = '#28A745';
      }
    } else if (gamePhase === 'seeking') {
      if (isChecked) {
        spotColor = '#DC3545';
        spotOpacity = 0.3;
      } else {
        spotColor = '#007AFF';
      }
    }

    const canInteract = gamePhase === 'hiding' && !isSeeker && (!spot.isOccupied || isMySpot);

    return (
      <TouchableOpacity
        key={spot.id}
        style={[
          styles.hidingSpot,
          {
            left: (spot.x / 800) * screenWidth * 0.9,
            top: (spot.y / 600) * screenHeight * 0.4,
            width: (spot.width / 800) * screenWidth * 0.9,
            height: (spot.height / 600) * screenHeight * 0.4,
            backgroundColor: spotColor,
            opacity: spotOpacity,
          },
        ]}
        onPress={() => handleSpotPress(spot.id)}
        disabled={!canInteract || isPerformingAction}
      >
        <Text style={styles.spotText}>{spot.name}</Text>
        {isMySpot && gamePhase === 'hiding' && (
          <Text style={[styles.spotText, { fontSize: 10, marginTop: 2 }]}>✓ Selected</Text>
        )}
        {isChecked && gamePhase === 'seeking' && (
          <View style={styles.checkedIndicator}>
            <Text style={[styles.spotText, { fontSize: 16, color: '#DC3545' }]}>✗</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getPhaseTitle = () => {
    if (!currentRoom) return 'Game';

    const phase = gameState.phase;
    const isSeeker = isCurrentPlayerSeeker();

    switch (phase) {
      case 'hiding':
        return isSeeker ? 'Wait for hiders...' : 'Select hiding spot';
      case 'seeking':
        return isSeeker ? 'Find the hiders!' : 'Stay hidden...';
      case 'results':
        return 'Round Results';
      case 'ended':
        return 'Game Over';
      default:
        return 'Game';
    }
  };

  const getPhaseSubtitle = useCallback(() => {
    if (!currentRoom) return '';

    const phase = gameState.phase;
    const isSeeker = isCurrentPlayerSeeker();
    const timeLeft = currentTimeLeft;
    const attempts = gameState.seekerAttempts;
    const maxAttempts = gameState.maxAttempts;
    const hiddenCount = Object.keys(gameState.hiddenPlayers).length;
    const totalHiders = currentRoom.players.filter((p) => p.isAlive && p.socketId !== gameState.seeker).length;

    switch (phase) {
      case 'hiding':
        if (isSeeker) {
          return `${hiddenCount}/${totalHiders} players hidden`;
        }
        return `${Math.ceil(timeLeft / 1000)}s remaining`;
      case 'seeking':
        return isSeeker ? `${maxAttempts - attempts} attempts left` : 'Seeker is looking for you';
      case 'results':
        return `Round ${gameState.currentRound} complete`;
      case 'ended':
        return 'Thanks for playing!';
      default:
        return '';
    }
  }, [currentRoom, gameState, isCurrentPlayerSeeker, currentTimeLeft]);

  const renderGamePhase = () => {
    if (!currentRoom) return null;

    const phase = gameState.phase;

    if (phase === 'results' || phase === 'ended') {
      const sortedPlayers = [...currentRoom.players].sort((a, b) => {
        const isAWinner = gameState.winner?.username === a.username;
        const isBWinner = gameState.winner?.username === b.username;

        if (isAWinner && !isBWinner) return -1;
        if (!isAWinner && isBWinner) return 1;

        if (a.isAlive && !b.isAlive) return -1;
        if (!a.isAlive && b.isAlive) return 1;

        return 0;
      });

      return (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsContainer}>
            {phase === 'ended' && gameState.winner && (
              <View style={styles.winnerHeader}>
                <Text style={styles.winnerEmoji}>🏆</Text>
                <Text style={styles.winnerTitle}>Winner: {gameState.winner.username}</Text>
              </View>
            )}

            <Text style={styles.resultsTitle}>{phase === 'ended' ? 'Final Results' : 'Round Results'}</Text>

            <View style={styles.playersList}>
              {sortedPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isCurrentPlayer={player.username === user?.username}
                  isSeeker={player.username === getSeekerUsername()}
                  gamePhase={phase}
                />
              ))}
            </View>

            {phase === 'ended' && (
              <Button label="Back to Lobby" onPress={() => router.replace('/lobby')} size="large" />
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.gameContainer}>
        <View style={styles.mapContainer}>
          <Image source={getMapImageSource(currentRoom.map.id)} style={styles.mapImage} resizeMode="contain" />

          {currentRoom.map.hidingSpots.map(renderHidingSpot)}

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
          <Text style={styles.playersTitle}>Players</Text>
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
          <Text style={styles.headerTitle}>{getPhaseTitle()}</Text>
          <Text style={styles.headerSubtitle}>{getPhaseSubtitle()}</Text>
        </View>

        <Button label="Leave" onPress={handleLeaveGame} variant="destructive" size="small" />
      </View>

      <View style={styles.gameInfoCard}>
        <View style={styles.gameInfoRow}>
          <Text style={styles.gameInfoLabel}>Map:</Text>
          <Text style={styles.gameInfoValue}>{currentRoom?.map.name}</Text>
        </View>
        <View style={styles.gameInfoRow}>
          <Text style={styles.gameInfoLabel}>Round:</Text>
          <Text style={styles.gameInfoValue}>{gameState.currentRound}</Text>
        </View>
        <View style={styles.gameInfoRow}>
          <Text style={styles.gameInfoLabel}>Phase:</Text>
          <Text
            style={[
              styles.gameInfoValue,
              {
                color: gameState.phase === 'hiding' ? '#FF6B35' : gameState.phase === 'seeking' ? '#DC3545' : '#6C757D',
              },
            ]}
          >
            {gameState.phase.charAt(0).toUpperCase() + gameState.phase.slice(1)}
          </Text>
        </View>
        <View style={styles.gameInfoRow}>
          <Text style={styles.gameInfoLabel}>Role:</Text>
          <Text style={[styles.gameInfoValue, { color: isCurrentPlayerSeeker() ? '#DC3545' : '#28A745' }]}>
            {isCurrentPlayerSeeker() ? 'Seeker' : 'Hider'}
          </Text>
        </View>
        {gameState.seeker && (
          <View style={styles.gameInfoRow}>
            <Text style={styles.gameInfoLabel}>Seeker:</Text>
            <Text style={[styles.gameInfoValue, { color: '#DC3545' }]}>{getSeekerUsername() || 'Unknown'}</Text>
          </View>
        )}
        {gameState.phase === 'hiding' && currentTimeLeft > 0 && (
          <View style={styles.gameInfoRow}>
            <Text style={styles.gameInfoLabel}>Time Left:</Text>
            <Text style={[styles.gameInfoValue, { color: '#FF6B35' }]}>{Math.ceil(currentTimeLeft / 1000)}s</Text>
          </View>
        )}
        {gameState.phase === 'seeking' && (
          <View style={styles.gameInfoRow}>
            <Text style={styles.gameInfoLabel}>Attempts:</Text>
            <Text style={[styles.gameInfoValue, { color: '#FF6B35' }]}>
              {gameState.seekerAttempts}/{gameState.maxAttempts}
            </Text>
          </View>
        )}
      </View>

      {renderGamePhase()}

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
    padding: 16,
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

  mapImage: {
    width: '100%',
    height: '100%',
  },

  hidingSpot: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
    minHeight: 40,
  },

  spotText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  checkedIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  playersContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },

  playersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },

  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  resultsContainer: {
    flex: 1,
    padding: 16,
  },

  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 24,
  },

  playersList: {
    marginBottom: 24,
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

  gameInfoCard: {
    padding: 12,
  },

  gameInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  gameInfoLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },

  gameInfoValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '600',
  },

  winnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },

  winnerEmoji: {
    fontSize: 32,
    marginRight: 8,
  },

  winnerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#856404',
  },
});
