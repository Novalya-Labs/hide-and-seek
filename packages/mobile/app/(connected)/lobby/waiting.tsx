import { useKeepAwake } from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Share, StyleSheet, View } from 'react-native';
import { PlayerCard } from '@/components/game';
import { Button, LoadingSpinner, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/authStore';
import { useRoomStore } from '@/features/room/roomStore';

export default function WaitingRoomScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentRoom, error, leaveRoom, startGame, clearError } = useRoomStore();

  const [isLeaving, setIsLeaving] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useKeepAwake();

  useEffect(() => {
    if (!currentRoom) {
      router.replace('/lobby');
      return;
    }
  }, [currentRoom, router]);

  useEffect(() => {
    if (!currentRoom || !user?.socketId) return;

    const isHost = currentRoom.players.find((p) => p.socketId === user.socketId)?.isHost ?? false;

    if (!isHost && currentRoom.status !== 'waiting') {
      router.replace('/game');
    }
  }, [currentRoom, user?.socketId, router]);

  const handleLeaveRoom = async () => {
    if (!currentRoom) return;

    setIsLeaving(true);
    try {
      await leaveRoom({ roomId: currentRoom.id });
      router.replace('/lobby');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to leave room');
    } finally {
      setIsLeaving(false);
    }
  };

  const handleStartGame = async () => {
    if (!currentRoom) return;

    if (currentRoom.players.length < 2) {
      Alert.alert('Error', 'Need at least 2 players to start the game');
      return;
    }

    setIsStarting(true);
    try {
      await startGame({ roomId: currentRoom.id });
      router.replace('/game');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to start game');
    } finally {
      setIsStarting(false);
    }
  };

  const handleShareRoom = async () => {
    if (!currentRoom?.code) return;

    try {
      await Share.share({
        message: `Join my Hide And Seek game! Room code: ${currentRoom.code}`,
        title: 'Join Hide And Seek Game',
      });
    } catch (error) {
      console.error('Error sharing room:', error);
    }
  };

  const isHost = currentRoom?.players.find((p) => p.socketId === user?.socketId)?.isHost ?? false;
  const canStartGame = isHost && currentRoom && currentRoom.players.length >= 2;
  const isLoadingHostStatus = !user?.username || !currentRoom?.players || currentRoom.players.length === 0;

  if (!currentRoom) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner visible text="Loading room..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Waiting Room</Text>
          <Text style={styles.subtitle}>
            {currentRoom.players.length}/{currentRoom.maxPlayers} players
          </Text>
        </View>

        <View style={styles.roomInfoCard}>
          <View style={styles.roomInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Map:</Text>
              <Text style={styles.infoValue}>{currentRoom.map.name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={styles.infoValue}>{currentRoom.isPrivate ? 'Private' : 'Public'}</Text>
            </View>

            {currentRoom.code && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Code:</Text>
                <View style={styles.codeContainer}>
                  <Text style={styles.codeText}>{currentRoom.code}</Text>
                  <Button label="Share" onPress={handleShareRoom} size="small" variant="outline" />
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.playersSection}>
          <Text style={styles.playersTitle}>Players</Text>

          {currentRoom.players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              isCurrentPlayer={player.username === user?.username}
              gamePhase={currentRoom.status}
            />
          ))}

          {currentRoom.players.length < currentRoom.maxPlayers && (
            <View style={styles.waitingCard}>
              <Text style={styles.waitingText}>
                Waiting for {currentRoom.maxPlayers - currentRoom.players.length} more player(s)...
              </Text>
            </View>
          )}
        </View>

        {isLoadingHostStatus ? (
          <View style={styles.hostCard}>
            <Text style={styles.hostTitle}>Loading...</Text>
            <Text style={styles.hostSubtitle}>Determining player status...</Text>
            <Button label="Start Game" onPress={() => {}} loading={true} disabled={true} size="large" />
          </View>
        ) : isHost ? (
          <View
            style={styles.hostCard}
            className="border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900"
          >
            <Text style={styles.hostTitle} className="text-blue-700 dark:text-blue-300">
              Host Controls
            </Text>
            <Text style={styles.hostSubtitle} className="text-blue-700 dark:text-blue-300">
              {canStartGame ? 'You can start the game now!' : 'Wait for more players to join'}
            </Text>

            <Button
              label="Start Game"
              onPress={handleStartGame}
              loading={isStarting}
              disabled={!canStartGame || isStarting}
              size="large"
            />
          </View>
        ) : (
          <View style={styles.waitingHostCard}>
            <Text style={styles.waitingHostText}>Waiting for host to start the game...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer} className="border-t border-gray-200 dark:border-gray-800">
        <Button
          label="Leave Room"
          onPress={handleLeaveRoom}
          variant="destructive"
          size="large"
          loading={isLeaving}
          disabled={isLeaving}
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button label="Dismiss" onPress={clearError} variant="outline" size="small" />
        </View>
      )}

      <LoadingSpinner visible={isStarting} overlay text={isStarting ? 'Starting game...' : 'Loading...'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  header: {
    padding: 24,
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 16,
    color: '#6C757D',
  },

  roomInfoCard: {
    marginHorizontal: 12,
    marginBottom: 24,
  },

  roomInfo: {
    // styles for room info content
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  infoLabel: {
    fontSize: 16,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },

  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  codeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    fontFamily: 'monospace',
  },

  playersSection: {
    paddingHorizontal: 12,
    marginBottom: 24,
  },

  playersTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },

  waitingCard: {
    marginTop: 8,
  },

  waitingText: {
    textAlign: 'center',
    color: '#6C757D',
    fontSize: 16,
    fontStyle: 'italic',
  },

  hostCard: {
    padding: 12,
    marginHorizontal: 12,
    borderRadius: 10,
    marginBottom: 24,
  },

  hostTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },

  hostSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },

  waitingHostCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },

  waitingHostText: {
    textAlign: 'center',
    color: '#6C757D',
    fontSize: 16,
    fontStyle: 'italic',
  },

  footer: {
    padding: 24,
    paddingTop: 16,
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
});
