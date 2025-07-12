import { useEffect, useState } from 'react';

interface UseGameTimerProps {
  gamePhase: string;
  gameTimeLeft: number;
  getCurrentTimeLeft: () => number;
}

export const useGameTimer = ({ gamePhase, gameTimeLeft, getCurrentTimeLeft }: UseGameTimerProps) => {
  const [currentTimeLeft, setCurrentTimeLeft] = useState(0);

  useEffect(() => {
    if (gamePhase === 'hiding' && gameTimeLeft > 0) {
      const interval = setInterval(() => {
        const remaining = getCurrentTimeLeft();
        setCurrentTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
    setCurrentTimeLeft(0);
  }, [gamePhase, gameTimeLeft, getCurrentTimeLeft]);

  return {
    currentTimeLeft,
  };
};
