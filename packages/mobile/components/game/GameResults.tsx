import type { Player, Room } from '@hide-and-seek/shared';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from '../ui';
import { PlayerCard } from './PlayerCard';

interface GameResultsProps {
  currentRoom: Room;
  gameState: {
    phase: string;
    winner: Player | null;
  };
  user: {
    username: string;
  } | null;
  getSeekerUsername: () => string | null;
}

export const GameResults: React.FC<GameResultsProps> = ({ currentRoom, gameState, user, getSeekerUsername }) => {
  const router = useRouter();

  if (!currentRoom) return null;

  const phase = gameState.phase;

  if (phase !== 'results' && phase !== 'ended') return null;

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

        {phase === 'ended' && <Button label="Back to Lobby" onPress={() => router.replace('/lobby')} size="large" />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  resultsContainer: {
    flex: 1,
    padding: 8,
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
