import type { Room } from '@hide-and-seek/shared';
import { Animated, StyleSheet, View } from 'react-native';
import { Text } from '../ui';

interface GamePhaseHeaderProps {
  currentRoom: Room;
  gameState: {
    phase: string;
  };
  isCurrentPlayerSeeker: () => boolean;
  currentTimeLeft: number;
  phaseAnim: Animated.Value;
  roleAnim: Animated.Value;
}

export const GamePhaseHeader: React.FC<GamePhaseHeaderProps> = ({
  currentRoom,
  gameState,
  isCurrentPlayerSeeker,
  currentTimeLeft,
  phaseAnim,
  roleAnim,
}) => {
  if (!currentRoom) return null;

  const phase = gameState.phase;
  const isSeeker = isCurrentPlayerSeeker();
  const timeLeft = currentTimeLeft;

  if (phase === 'results' || phase === 'ended') return null;

  let phaseTitle = '';
  let phaseColor = '';
  let phaseIcon = '';
  let roleTitle = '';
  let roleColor = '';
  let roleIcon = '';

  switch (phase) {
    case 'hiding':
      phaseTitle = 'HIDE !!';
      phaseColor = '#FF6B35';
      phaseIcon = '🙈';
      roleTitle = isSeeker ? 'SEEKER' : 'HIDER';
      roleColor = isSeeker ? '#DC3545' : '#28A745';
      roleIcon = isSeeker ? '👀' : '🏃‍♂️';
      break;
    case 'seeking':
      phaseTitle = 'SEEKING !!';
      phaseColor = '#DC3545';
      phaseIcon = '🔍';
      roleTitle = isSeeker ? 'SEEKER' : 'HIDER';
      roleColor = isSeeker ? '#DC3545' : '#28A745';
      roleIcon = isSeeker ? '👀' : '🤫';
      break;
  }

  return (
    <View style={[styles.phaseHeader, { backgroundColor: phaseColor }]}>
      <Animated.View style={[styles.phaseContainer, { transform: [{ scale: phaseAnim }] }]}>
        <Text style={styles.phaseIcon}>{phaseIcon}</Text>
        <Text style={styles.phaseTitle}>{phaseTitle}</Text>
      </Animated.View>

      {phase === 'hiding' && timeLeft > 0 && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{Math.ceil(timeLeft / 1000)}s</Text>
        </View>
      )}

      <Animated.View
        style={[styles.roleContainer, { backgroundColor: roleColor }, { transform: [{ scale: roleAnim }] }]}
      >
        <Text style={styles.roleIcon}>{roleIcon}</Text>
        <Text style={styles.roleTitle}>{roleTitle}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  phaseHeader: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },

  phaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 10,
  },

  phaseIcon: {
    fontSize: 28,
    marginRight: 10,
  },

  phaseTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },

  timerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
  },

  timerText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },

  roleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  roleIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
