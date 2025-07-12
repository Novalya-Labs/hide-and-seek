import { useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface UseGameAnimationsProps {
  gamePhase: string;
  isCurrentPlayerSeeker: () => boolean;
}

export const useGameAnimations = ({ gamePhase, isCurrentPlayerSeeker }: UseGameAnimationsProps) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const heartbeatAnim = useRef(new Animated.Value(1)).current;
  const phaseAnim = useRef(new Animated.Value(1)).current;
  const roleAnim = useRef(new Animated.Value(1)).current;

  const startPulseAnimation = useCallback(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();
    return pulseLoop;
  }, [pulseAnim]);

  const startHeartbeatAnimation = useCallback(() => {
    const heartbeatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(heartbeatAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    heartbeatLoop.start();
    return heartbeatLoop;
  }, [heartbeatAnim]);

  const startPhaseAnimation = useCallback(() => {
    const phaseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(phaseAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(phaseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    phaseLoop.start();
    return phaseLoop;
  }, [phaseAnim]);

  const startRoleAnimation = useCallback(() => {
    const roleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(roleAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(roleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    roleLoop.start();
    return roleLoop;
  }, [roleAnim]);

  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation | null = null;

    if (gamePhase === 'hiding' && !isCurrentPlayerSeeker()) {
      pulseAnimation = startPulseAnimation();
    }

    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
  }, [gamePhase, isCurrentPlayerSeeker, startPulseAnimation]);

  useEffect(() => {
    let heartbeatAnimation: Animated.CompositeAnimation | null = null;

    if (gamePhase === 'seeking' && !isCurrentPlayerSeeker()) {
      heartbeatAnimation = startHeartbeatAnimation();
    }

    return () => {
      if (heartbeatAnimation) {
        heartbeatAnimation.stop();
      }
    };
  }, [gamePhase, isCurrentPlayerSeeker, startHeartbeatAnimation]);

  useEffect(() => {
    let phaseAnimation: Animated.CompositeAnimation | null = null;

    if (gamePhase === 'hiding' || gamePhase === 'seeking') {
      phaseAnimation = startPhaseAnimation();
    }

    return () => {
      if (phaseAnimation) {
        phaseAnimation.stop();
      }
    };
  }, [gamePhase, startPhaseAnimation]);

  useEffect(() => {
    let roleAnimation: Animated.CompositeAnimation | null = null;

    if (gamePhase === 'hiding' || gamePhase === 'seeking') {
      roleAnimation = startRoleAnimation();
    }

    return () => {
      if (roleAnimation) {
        roleAnimation.stop();
      }
    };
  }, [gamePhase, startRoleAnimation]);

  return {
    pulseAnim,
    heartbeatAnim,
    phaseAnim,
    roleAnim,
  };
};
