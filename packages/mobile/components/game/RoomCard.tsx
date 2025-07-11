import type { RoomSummary } from '@hide-and-seek/shared';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../ui';

interface RoomCardProps {
  room: RoomSummary;
  onJoin: (roomId: string) => void;
  disabled?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin, disabled = false }) => {
  const getStatusColor = () => {
    return '#28A745';
  };

  const getStatusText = () => {
    return 'Waiting for players';
  };

  const isJoinable = room.playerCount < room.maxPlayers;
  const isFull = room.playerCount >= room.maxPlayers;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.roomId}>Room {room.id}</Text>
          {room.isPrivate && (
            <View style={styles.privateBadge}>
              <Text style={styles.privateBadgeText}>PRIVATE</Text>
            </View>
          )}
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.status, { color: getStatusColor() }]}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Players:</Text>
          <Text style={[styles.detailValue, isFull && styles.fullText]}>
            {room.playerCount}/{room.maxPlayers}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Map:</Text>
          <Text style={styles.detailValue}>{room.mapName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Host:</Text>
          <Text style={styles.detailValue}>{room.hostName}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.joinButton, !isJoinable && styles.joinButtonDisabled, disabled && styles.joinButtonDisabled]}
        onPress={() => onJoin(room.id)}
        disabled={!isJoinable || disabled}
      >
        <Text
          style={[
            styles.joinButtonText,
            !isJoinable && styles.joinButtonTextDisabled,
            disabled && styles.joinButtonTextDisabled,
          ]}
        >
          {isFull ? 'Full' : !isJoinable ? 'In Game' : 'Join'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  info: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  roomId: {
    fontSize: 16,
    fontWeight: '600',
  },

  privateBadge: {
    backgroundColor: '#FF6B35',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },

  privateBadgeText: {
    fontSize: 10,
    fontWeight: '700',
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

  details: {
    marginBottom: 16,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  detailLabel: {
    fontSize: 14,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },

  fullText: {
    color: '#DC3545',
  },

  codeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    fontFamily: 'monospace',
  },

  joinButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },

  joinButtonDisabled: {
    backgroundColor: '#E9ECEF',
  },

  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },

  joinButtonTextDisabled: {},
});
