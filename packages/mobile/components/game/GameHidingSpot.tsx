import type { HidingSpot } from '@hide-and-seek/shared';
import { Animated, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../ui';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface GameHidingSpotProps {
  spot: HidingSpot;
  gameState: {
    phase: string;
  };
  isCurrentPlayerSeeker: () => boolean;
  getCurrentPlayerHidingSpot: () => string | null;
  isSpotChecked: (spotId: string) => boolean;
  getSeekerProximity: () => number;
  handleSpotPress: (spotId: string) => void;
  isPerformingAction: boolean;
  pulseAnim: Animated.Value;
}

export const GameHidingSpot: React.FC<GameHidingSpotProps> = ({
  spot,
  gameState,
  isCurrentPlayerSeeker,
  getCurrentPlayerHidingSpot,
  isSpotChecked,
  getSeekerProximity,
  handleSpotPress,
  isPerformingAction,
  pulseAnim,
}) => {
  const gamePhase = gameState.phase;
  const isSeeker = isCurrentPlayerSeeker();
  const currentPlayerSpot = getCurrentPlayerHidingSpot();
  const isMySpot = currentPlayerSpot === spot.id;
  const isChecked = isSpotChecked(spot.id);
  const proximity = getSeekerProximity();

  let spotColor = '#007AFF';
  let spotOpacity = 0.7;
  let showSpotLabel = true;
  let shouldPulse = false;

  if (gamePhase === 'hiding') {
    if (spot.isOccupied && !isSeeker) {
      spotColor = isMySpot ? '#28A745' : '#DC3545';
    } else if (isMySpot) {
      spotColor = '#28A745';
    } else if (!isSeeker) {
      shouldPulse = true;
    }
  } else if (gamePhase === 'seeking') {
    if (isMySpot && !isSeeker) {
      spotColor = '#28A745';
      spotOpacity = 0.9;
      showSpotLabel = true;

      if (proximity > 0.6) {
        spotColor = '#FF6B35';
      } else if (proximity > 0.3) {
        spotColor = '#FFA500';
      }
    } else if (isChecked) {
      spotColor = '#DC3545';
      spotOpacity = 0.3;
      showSpotLabel = true;
    } else if (!isSeeker) {
      spotColor = 'rgba(0, 122, 255, 0.1)';
      spotOpacity = 0.1;
      showSpotLabel = false;
    } else {
      spotColor = '#007AFF';
      showSpotLabel = true;
    }
  }

  const canInteract = gamePhase === 'hiding' && !isSeeker && (!spot.isOccupied || isMySpot);
  const animatedStyle = shouldPulse ? { transform: [{ scale: pulseAnim }] } : {};

  return (
    <Animated.View
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
          borderColor: isMySpot ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
          borderWidth: isMySpot ? 3 : 2,
        },
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        style={styles.spotTouchable}
        onPress={() => handleSpotPress(spot.id)}
        disabled={!canInteract || isPerformingAction}
      >
        {showSpotLabel && <Text style={[styles.spotText, { opacity: spotOpacity < 0.3 ? 0.8 : 1 }]}>{spot.name}</Text>}
        {isMySpot && gamePhase === 'hiding' && (
          <Text style={[styles.spotText, { fontSize: 10, marginTop: 2 }]}>✓ Selected</Text>
        )}
        {isMySpot && gamePhase === 'seeking' && !isSeeker && (
          <View style={styles.mySpotIndicator}>
            <Text style={[styles.spotText, { fontSize: 14, color: '#FFFFFF' }]}>🙈</Text>
          </View>
        )}
        {isMySpot && gamePhase === 'seeking' && !isSeeker && proximity > 0.3 && (
          <View style={styles.proximityIndicator}>
            <Text style={styles.proximityText}>{proximity > 0.8 ? '🚨' : proximity > 0.6 ? '⚠️' : '👀'}</Text>
          </View>
        )}
        {isChecked && gamePhase === 'seeking' && (
          <View style={styles.checkedIndicator}>
            <Text style={[styles.spotText, { fontSize: 16, color: '#DC3545' }]}>✗</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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

  mySpotIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(40, 167, 69, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  spotTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  proximityIndicator: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },

  proximityText: {
    fontSize: 14,
    color: '#FF6B35',
  },
});
