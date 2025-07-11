import type { SeekerPosition } from '@hide-and-seek/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { PanGestureHandler, type PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { PlayerAvatar } from '@/components/ui';
import { useGameStore } from '@/features/game/gameStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SeekerCursorProps {
  seekerAvatar: string;
  mapWidth: number;
  mapHeight: number;
  isCurrentSeeker: boolean;
}

export const SeekerCursor: React.FC<SeekerCursorProps> = ({ seekerAvatar, mapWidth, mapHeight, isCurrentSeeker }) => {
  const { currentSeekerPosition, moveSeekerTo } = useGameStore();
  const [isDragging, setIsDragging] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const lastMoveTime = useRef(0);
  const MOVE_THROTTLE = 50;

  const updateSeekerPosition = useCallback(
    (x: number, y: number) => {
      const now = Date.now();
      if (now - lastMoveTime.current < MOVE_THROTTLE) return;

      lastMoveTime.current = now;

      const normalizedX = Math.max(0, Math.min(mapWidth, x));
      const normalizedY = Math.max(0, Math.min(mapHeight, y));

      moveSeekerTo({
        x: normalizedX,
        y: normalizedY,
      });
    },
    [mapWidth, mapHeight, moveSeekerTo],
  );

  const onPanGestureEvent = useCallback(
    (event: PanGestureHandlerGestureEvent) => {
      if (!isCurrentSeeker) return;

      const { translationX, translationY } = event.nativeEvent;

      const newX = translationX;
      const newY = translationY;

      translateX.setValue(newX);
      translateY.setValue(newY);

      const screenX = (newX / (screenWidth * 0.9)) * mapWidth;
      const screenY = (newY / (screenHeight * 0.4)) * mapHeight;

      updateSeekerPosition(screenX, screenY);
    },
    [isCurrentSeeker, updateSeekerPosition, mapWidth, mapHeight, translateX, translateY],
  );

  const onPanHandlerStateChange = useCallback(
    (event: any) => {
      const { state } = event.nativeEvent;

      if (state === 2) {
        // BEGAN
        setIsDragging(true);
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
    [scale],
  );

  useEffect(() => {
    if (currentSeekerPosition && !isDragging) {
      const screenX = (currentSeekerPosition.x / mapWidth) * (screenWidth * 0.9);
      const screenY = (currentSeekerPosition.y / mapHeight) * (screenHeight * 0.4);

      Animated.timing(translateX, {
        toValue: screenX,
        duration: 100,
        useNativeDriver: true,
      }).start();

      Animated.timing(translateY, {
        toValue: screenY,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [currentSeekerPosition, isDragging, translateX, translateY, mapWidth, mapHeight]);

  if (!currentSeekerPosition) return null;

  const CursorComponent = (
    <Animated.View
      style={[
        styles.cursor,
        {
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    >
      <View style={styles.avatarContainer}>
        <PlayerAvatar avatar={seekerAvatar} size={32} />
      </View>
      {isDragging && <View style={styles.shadow} />}
    </Animated.View>
  );

  if (isCurrentSeeker) {
    return (
      <PanGestureHandler
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onPanHandlerStateChange}
        enableTrackpadTwoFingerGesture={false}
      >
        {CursorComponent}
      </PanGestureHandler>
    );
  }

  return CursorComponent;
};

const styles = StyleSheet.create({
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
