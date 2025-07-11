import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { useTheme } from '@/contexts/theme-context';
import { useAuthStore } from '@/features/auth/authStore';
import { useRoomStore } from '@/features/room/roomStore';
import { notificationService } from '@/lib/notify';

interface JoinRoomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const JoinRoomSheet: React.FC<JoinRoomSheetProps> = ({ visible, onClose }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuthStore();
  const router = useRouter();
  const sheetRef = useRef<BottomSheetModal>(null);
  const { joinRoomWithCode, isJoining } = useRoomStore();

  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleJoinRoom = useCallback(async () => {
    if (!roomCode || !user) return;

    try {
      await notificationService.notify({
        type: 'success',
        message: 'Room joined',
      });

      await joinRoomWithCode({ code: roomCode, playerName: user.username, avatar: user.avatar });
      handleClose();

      router.replace('/lobby/waiting');
    } catch (error) {
      await notificationService.notify({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error joining room',
      });
    }
  }, [joinRoomWithCode, roomCode, user, handleClose, router]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} enableTouchThrough={true} appearsOnIndex={0} disappearsOnIndex={-1} />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={visible ? 0 : -1}
      backgroundStyle={{ backgroundColor: isDarkMode ? 'black' : 'white' }}
      handleIndicatorStyle={{ backgroundColor: isDarkMode ? 'white' : 'black' }}
      enablePanDownToClose
      onDismiss={handleClose}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView className="pb-8 items-center">
        <View className="px-4 py-5 items-center w-full">
          <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-neutral-800 justify-center items-center">
            <Ionicons name="game-controller-outline" size={32} color={isDarkMode ? '#fff' : '#000'} />
          </View>

          <Text variant="h3" weight="bold" center className="text-gray-600 dark:text-gray-400 mt-4">
            Join Room
          </Text>

          <Text variant="body" center className="text-gray-600 dark:text-gray-400 mt-2">
            Enter the room code to join a room
          </Text>
        </View>

        <View className="px-4 w-full mb-4">
          <BottomSheetTextInput
            placeholder="Room Code"
            value={roomCode}
            onChangeText={setRoomCode}
            className="mb-4 p-4 border border-gray-200 dark:border-neutral-800 rounded-lg text-black dark:text-white"
          />
        </View>

        <View className="px-4 w-full">
          <View className="flex-row gap-2">
            <Button
              label="Cancel"
              onPress={handleClose}
              variant="secondary"
              size="large"
              className="flex-1"
              disabled={isJoining}
            />
            <Button
              label="Join"
              onPress={handleJoinRoom}
              variant="primary"
              size="large"
              className="flex-1"
              disabled={!roomCode}
              loading={isJoining}
            />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default JoinRoomSheet;
