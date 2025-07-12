import { StyleSheet, View } from 'react-native';
import { Text } from '../ui';

interface GameInfoCardProps {
  gameState: {
    seeker: string | null;
    phase: string;
    seekerAttempts: number;
    maxAttempts: number;
  };
  getSeekerUsername: () => string | null;
}

export const GameInfoCard: React.FC<GameInfoCardProps> = ({ gameState, getSeekerUsername }) => {
  return (
    <View style={styles.gameInfoCard}>
      {gameState.seeker && (
        <View style={styles.gameInfoRow}>
          <Text style={styles.gameInfoLabel}>Seeker:</Text>
          <Text style={[styles.gameInfoValue, { color: '#DC3545' }]}>{getSeekerUsername() || 'Unknown'}</Text>
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
  );
};

const styles = StyleSheet.create({
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
});
