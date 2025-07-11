import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { MAPS } from '@/constants/Maps';
import { useTheme } from '@/contexts/theme-context';
import { useAuthStore } from '@/features/auth/authStore';
import { useRoomStore } from '@/features/room/roomStore';
import { notificationService } from '@/lib/notify';

interface CreateRoomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const CreateRoomSheet: React.FC<CreateRoomSheetProps> = ({ visible, onClose }) => {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const sheetRef = useRef<BottomSheetModal>(null);
  const { createRoom, isCreating } = useRoomStore();

  const [maxPlayers, setMaxPlayers] = useState('4');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedMap, setSelectedMap] = useState(MAPS[0].id);

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

  const handleCreateRoom = useCallback(async () => {
    if (!user) return;

    try {
      await createRoom({
        maxPlayers: Number.parseInt(maxPlayers),
        isPrivate,
        mapId: selectedMap,
        playerName: user.username,
        avatar: user.avatar,
      });

      await notificationService.notify({
        type: 'success',
        message: 'Room created successfully',
      });

      handleClose();

      router.replace('/lobby/waiting');
    } catch (error) {
      await notificationService.notify({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error creating room',
      });
    }
  }, [createRoom, maxPlayers, isPrivate, selectedMap, user, handleClose, router]);

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
            Create Room
          </Text>

          <Text variant="body" center className="text-gray-600 dark:text-gray-400 mt-2">
            Create a new room to play with your friends
          </Text>
        </View>

        <ScrollView className="w-full px-4">
          <View className="py-4">
            <Text className="mb-2">Max Players:</Text>
            <BottomSheetTextInput
              placeholder="Max Players (2-10)"
              value={maxPlayers}
              onChangeText={setMaxPlayers}
              keyboardType="numeric"
              className="mb-4 p-4 border border-gray-200 dark:border-neutral-800 rounded-lg"
            />

            <View className="flex-row justify-between items-center mb-4">
              <Text>Private Room</Text>
              <Switch value={isPrivate} onValueChange={setIsPrivate} trackColor={{ true: '#0D80F2' }} />
            </View>

            <Text className="mb-2">Map:</Text>
            <View className="gap-2">
              {MAPS.map((map) => (
                <Button
                  key={map.id}
                  label={map.name}
                  variant={selectedMap === map.id ? 'primary' : 'outline'}
                  onPress={() => setSelectedMap(map.id)}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <View className="px-4 w-full">
          <View className="flex-row gap-2">
            <Button
              label="Cancel"
              onPress={handleClose}
              variant="secondary"
              size="large"
              className="flex-1"
              disabled={isCreating}
            />
            <Button
              label="Create"
              onPress={handleCreateRoom}
              variant="primary"
              size="large"
              className="flex-1"
              disabled={!maxPlayers}
              loading={isCreating}
            />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default CreateRoomSheet;
