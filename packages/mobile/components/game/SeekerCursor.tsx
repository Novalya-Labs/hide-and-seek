import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  PanGestureHandler,
  type PanGestureHandlerGestureEvent,
  type PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import { PlayerAvatar } from '@/components/ui';
import { useGameStore } from '@/features/game/gameStore';

interface SeekerCursorProps {
  seekerAvatar: string;
  mapWidth: number;
  mapHeight: number;
  isCurrentSeeker: boolean;
  containerWidth: number;
  containerHeight: number;
}

export const SeekerCursor: React.FC<SeekerCursorProps> = ({
  seekerAvatar,
  mapWidth,
  mapHeight,
  isCurrentSeeker,
  containerWidth,
  containerHeight,
}) => {
  const { currentSeekerPosition, moveSeekerTo } = useGameStore();
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Refs for immediate visual updates
  const cursorRef = useRef<View>(null);
  const lastSentTime = useRef(0);
  const THROTTLE_MS = 50; // Limite à 20 FPS pour le réseau

  const sendPositionToServer = useCallback(
    async (screenX: number, screenY: number) => {
      try {
        if (containerWidth <= 0 || containerHeight <= 0) return;

        const mapX = (screenX / containerWidth) * mapWidth;
        const mapY = (screenY / containerHeight) * mapHeight;
        const normalizedX = Math.max(0, Math.min(mapWidth, mapX));
        const normalizedY = Math.max(0, Math.min(mapHeight, mapY));

        await moveSeekerTo({ x: normalizedX, y: normalizedY });
      } catch (error) {
        console.error('Error sending position:', error);
      }
    },
    [containerWidth, containerHeight, mapWidth, mapHeight, moveSeekerTo],
  );

  const updateVisualPosition = useCallback((x: number, y: number) => {
    // Mise à jour visuelle immédiate sans setState
    if (cursorRef.current) {
      cursorRef.current.setNativeProps({
        style: {
          left: x - 20,
          top: y - 20,
        },
      });
    }
  }, []);

  const handleMovement = useCallback(
    (x: number, y: number) => {
      if (!isCurrentSeeker) return;

      // 1. Mise à jour visuelle immédiate (fluide)
      updateVisualPosition(x, y);

      // 2. Envoi réseau throttlé (performance)
      const now = Date.now();
      if (now - lastSentTime.current >= THROTTLE_MS) {
        lastSentTime.current = now;
        sendPositionToServer(x, y);
      }
    },
    [isCurrentSeeker, updateVisualPosition, sendPositionToServer],
  );

  const onGestureEvent = useCallback(
    (event: PanGestureHandlerGestureEvent) => {
      const { x, y } = event.nativeEvent;
      handleMovement(x, y);
    },
    [handleMovement],
  );

  const onHandlerStateChange = useCallback(
    (event: PanGestureHandlerStateChangeEvent) => {
      const { state, x, y } = event.nativeEvent;

      if (state === State.BEGAN || state === State.ACTIVE) {
        handleMovement(x, y);
      }
    },
    [handleMovement],
  );

  // Update cursor position from server (other players)
  useEffect(() => {
    if (currentSeekerPosition && !isCurrentSeeker) {
      const screenX = (currentSeekerPosition.x / mapWidth) * containerWidth;
      const screenY = (currentSeekerPosition.y / mapHeight) * containerHeight;
      setCursorPosition({ x: screenX, y: screenY });
    }
  }, [currentSeekerPosition, isCurrentSeeker, mapWidth, mapHeight, containerWidth, containerHeight]);

  const CursorComponent = (
    <View
      ref={cursorRef}
      style={[
        styles.cursor,
        {
          left: cursorPosition.x - 20,
          top: cursorPosition.y - 20,
        },
      ]}
    >
      <View style={styles.avatarContainer}>
        <PlayerAvatar avatar={seekerAvatar} size="small" />
      </View>
    </View>
  );

  if (isCurrentSeeker) {
    return (
      <View style={styles.mapTouchArea}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          shouldCancelWhenOutside={false}
          minDist={0}
        >
          <View style={styles.fullMapArea}>{CursorComponent}</View>
        </PanGestureHandler>
      </View>
    );
  }

  return CursorComponent;
};

const styles = StyleSheet.create({
  mapTouchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },

  fullMapArea: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  cursor: {
    position: 'absolute',
    width: 40,
    height: 40,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarContainer: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#007AFF',
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
