import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';

interface UseGameProximityProps {
  gamePhase: string;
  isCurrentPlayerSeeker: () => boolean;
  getSeekerProximity: () => number;
}

export const useGameProximity = ({ gamePhase, isCurrentPlayerSeeker, getSeekerProximity }: UseGameProximityProps) => {
  const proximityCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (gamePhase === 'seeking' && !isCurrentPlayerSeeker()) {
      proximityCheckInterval.current = setInterval(() => {
        const proximity = getSeekerProximity();

        if (proximity > 0.8) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else if (proximity > 0.6) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (proximity > 0.4) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }, 500);
    } else {
      if (proximityCheckInterval.current) {
        clearInterval(proximityCheckInterval.current);
        proximityCheckInterval.current = null;
      }
    }

    return () => {
      if (proximityCheckInterval.current) {
        clearInterval(proximityCheckInterval.current);
        proximityCheckInterval.current = null;
      }
    };
  }, [gamePhase, isCurrentPlayerSeeker, getSeekerProximity]);
};
