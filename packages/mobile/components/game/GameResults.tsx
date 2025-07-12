import type { GameState, Player, Room } from '@hide-and-seek/shared';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from '../ui';
import { PlayerCard } from './PlayerCard';

interface GameResultsProps {
  currentRoom: Room;
  gameState: GameState;
  user: {
    username: string;
  } | null;
  getSeekerUsername: () => string | null;
}

export const GameResults: React.FC<GameResultsProps> = ({ currentRoom, gameState, user, getSeekerUsername }) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (gameState.phase === 'results' && gameState.timeLeft > 0) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, gameState.timeLeft - (Date.now() - gameState.phaseStartTime));
        setCountdown(Math.ceil(remaining / 1000));

        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameState.phase, gameState.timeLeft, gameState.phaseStartTime]);

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

        <Text style={styles.resultsTitle}>
          {phase === 'ended' ? 'Final Results' : `Round ${gameState.currentRound} Results`}
        </Text>

        {phase === 'results' && countdown > 0 && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>Next round in</Text>
            <Text style={styles.countdownNumber}>{countdown}</Text>
            <Text style={styles.countdownText}>seconds</Text>
          </View>
        )}

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

  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },

  countdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565C0',
    marginHorizontal: 4,
  },

  countdownNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0D47A1',
    marginHorizontal: 8,
  },
});
