import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { PanGestureHandler, type PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
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
  const [isDragging, setIsDragging] = useState(false);

  const cursorX = useRef(new Animated.Value(0)).current;
  const cursorY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const lastMoveTime = useRef(0);
  const MOVE_THROTTLE = 50;

  const updateSeekerPosition = useCallback(
    (screenX: number, screenY: number) => {
      const now = Date.now();
      if (now - lastMoveTime.current < MOVE_THROTTLE) return;

      lastMoveTime.current = now;

      // Convert screen coordinates to map coordinates
      const mapX = (screenX / containerWidth) * mapWidth;
      const mapY = (screenY / containerHeight) * mapHeight;

      const normalizedX = Math.max(0, Math.min(mapWidth, mapX));
      const normalizedY = Math.max(0, Math.min(mapHeight, mapY));

      moveSeekerTo({
        x: normalizedX,
        y: normalizedY,
      });
    },
    [mapWidth, mapHeight, containerWidth, containerHeight, moveSeekerTo],
  );

  const onPanGestureEvent = useCallback(
    (event: PanGestureHandlerGestureEvent) => {
      if (!isCurrentSeeker) return;

      const { absoluteX, absoluteY } = event.nativeEvent;

      // Update cursor position immediately
      cursorX.setValue(absoluteX);
      cursorY.setValue(absoluteY);

      // Update seeker position
      updateSeekerPosition(absoluteX, absoluteY);
    },
    [isCurrentSeeker, updateSeekerPosition, cursorX, cursorY],
  );

  const onPanHandlerStateChange = useCallback(
    (event: any) => {
      const { state, absoluteX, absoluteY } = event.nativeEvent;

      if (state === 2) {
        // BEGAN - teleport cursor to touch position
        setIsDragging(true);
        cursorX.setValue(absoluteX);
        cursorY.setValue(absoluteY);
        updateSeekerPosition(absoluteX, absoluteY);

        Animated.spring(scale, {
          toValue: 1.2,
          useNativeDriver: true,
        }).start();
      } else if (state === 3 || state === 4 || state === 5) {
        // END, CANCELLED, FAILED
        setIsDragging(false);
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    },
    [scale, cursorX, cursorY, updateSeekerPosition],
  );

  // Update cursor position when seeker position changes from server
  useEffect(() => {
    const position = currentSeekerPosition || { x: 0, y: 0 };
    if (!isDragging) {
      const screenX = (position.x / mapWidth) * containerWidth;
      const screenY = (position.y / mapHeight) * containerHeight;

      Animated.timing(cursorX, {
        toValue: screenX,
        duration: 100,
        useNativeDriver: true,
      }).start();

      Animated.timing(cursorY, {
        toValue: screenY,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [currentSeekerPosition, isDragging, cursorX, cursorY, mapWidth, mapHeight, containerWidth, containerHeight]);

  const CursorComponent = (
    <Animated.View
      style={[
        styles.cursor,
        {
          transform: [{ translateX: cursorX }, { translateY: cursorY }, { scale }],
        },
      ]}
    >
      <View style={styles.avatarContainer}>
        <PlayerAvatar avatar={seekerAvatar} size="small" />
      </View>
      {isDragging && <View style={styles.shadow} />}
    </Animated.View>
  );

  if (isCurrentSeeker) {
    return (
      <View style={styles.mapTouchArea}>
        <PanGestureHandler
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onPanHandlerStateChange}
          enableTrackpadTwoFingerGesture={false}
        >
          <Animated.View style={styles.fullMapArea}>{CursorComponent}</Animated.View>
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

  shadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 999,
    zIndex: -1,
  },
});
