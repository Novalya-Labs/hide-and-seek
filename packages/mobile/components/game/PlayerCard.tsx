import type { Player, RoomStatus } from '@hide-and-seek/shared';
import { StyleSheet, Text, View } from 'react-native';
import { PlayerAvatar } from '../ui';

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer?: boolean;
  isSeeker?: boolean;
  gamePhase?: RoomStatus;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isCurrentPlayer = false,
  isSeeker = false,
  gamePhase = 'waiting',
}) => {
  const getStatusColor = () => {
    if (!player.isAlive) return '#DC3545';
    if (isSeeker) return '#FF6B35';
    if (gamePhase === 'hiding' && player.hidingSpot) return '#28A745';
    return '#007AFF';
  };

  const getStatusText = () => {
    if (!player.isAlive) return 'Eliminated';
    if (isSeeker) return 'Seeker';
    if (gamePhase === 'hiding' && player.hidingSpot) return 'Hidden';
    if (gamePhase === 'hiding' && !player.hidingSpot) return 'Hiding...';
    return 'Alive';
  };

  const cardStyle = {
    ...styles.container,
    ...(isCurrentPlayer && styles.currentPlayer),
    ...(!player.isAlive && styles.eliminated),
  };

  return (
    <View style={cardStyle}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <PlayerAvatar avatar={player.avatar} size="medium" />
          {player.isHost && (
            <View style={styles.hostBadge}>
              <Text style={styles.hostText}>HOST</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, !player.isAlive && styles.eliminatedText]}>{player.username}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.status, { color: getStatusColor() }]}>{getStatusText()}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    padding: 2,
  },

  currentPlayer: {
    borderColor: '#007AFF',
    borderRadius: 10,
    borderWidth: 2,
  },

  eliminated: {
    opacity: 0.6,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },

  hostBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },

  hostText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },

  eliminatedText: {
    color: '#6C757D',
    textDecorationLine: 'line-through',
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  status: {
    fontSize: 12,
    fontWeight: '500',
  },
});
