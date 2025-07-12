import { StyleSheet, View } from 'react-native';
import { Text } from '../ui';

interface GameMapOverlayProps {
  shouldShowMapOverlay: () => boolean;
}

export const GameMapOverlay: React.FC<GameMapOverlayProps> = ({ shouldShowMapOverlay }) => {
  if (!shouldShowMapOverlay()) return null;

  return (
    <View style={styles.mapOverlay}>
      <View style={styles.overlayContent}>
        <Text style={styles.overlayTitle}>🌙 Ready to Hide</Text>
        <Text style={styles.overlayText}>All players have selected their hiding spots!</Text>
        <Text style={styles.overlaySubtext}>The seeker will start searching soon...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  overlayContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  overlayTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },

  overlayText: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 4,
    textAlign: 'center',
  },

  overlaySubtext: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
