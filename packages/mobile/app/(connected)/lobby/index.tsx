import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { RoomCard } from '@/components/game';
import CreateRoomSheet from '@/components/sheets/CreateRoomSheet';
import JoinRoomSheet from '@/components/sheets/JoinRoomSheet';
import { Button, LoadingSpinner, PlayerAvatar, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/authStore';
import { useRoomStore } from '@/features/room/roomStore';
import { socketService } from '@/services/socket.service';

const LobbyScreen: React.FC = () => {
  const router = useRouter();
  const { user, reset: resetAuth } = useAuthStore();
  const {
    availableRooms,
    joinRoom,
    fetchAvailableRooms,
    reset: resetRoom,
    isCreating,
    isJoining,
    error,
    clearError,
  } = useRoomStore();

  useKeepAwake();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleJoinRoom = async (roomId: string) => {
    if (!user?.username) {
      Alert.alert('Error', 'Please set your username first');
      return;
    }

    try {
      await joinRoom({
        roomId,
        playerName: user.username,
        avatar: user.avatar,
      });

      router.push('/lobby/waiting');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to join room');
    }
  };

  const handleDisconnect = () => {
    Alert.alert('Disconnect', 'Are you sure you want to disconnect? You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: () => {
          socketService.disconnect();
          resetAuth();
          resetRoom();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header} className="border-b border-gray-200 dark:border-gray-800">
        <View style={styles.userInfo}>
          <PlayerAvatar avatar={user?.avatar} size="small" />
          <Text weight="bold">{user?.username}</Text>
        </View>
        <Button
          leftIcon={<Ionicons name="log-out-outline" size={24} color="#6C757D" />}
          onPress={handleDisconnect}
          variant="link"
          size="small"
        />
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.actions}>
          <Button
            label="Create Room"
            onPress={() => setShowCreateForm(!showCreateForm)}
            size="large"
            style={styles.actionButton}
          />

          <Button
            label="Join with Code"
            onPress={() => setShowJoinForm(!showJoinForm)}
            variant="outline"
            size="large"
            style={styles.actionButton}
          />
        </View>

        <View style={styles.roomsList}>
          <View style={styles.roomsHeader}>
            <Text style={styles.roomsTitle}>Available Rooms</Text>
            <Button
              leftIcon={<Ionicons name="refresh" size={16} color="#6C757D" />}
              onPress={() => fetchAvailableRooms({})}
              variant="link"
              size="small"
            />
          </View>

          {availableRooms.length === 0 ? (
            <View>
              <Text style={styles.noRoomsText}>No rooms available</Text>
            </View>
          ) : (
            availableRooms.map((room) => (
              <RoomCard key={room.id} room={room} onJoin={handleJoinRoom} disabled={isJoining} />
            ))
          )}
        </View>
      </ScrollView>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button label="Dismiss" onPress={clearError} variant="outline" size="small" />
        </View>
      )}

      <LoadingSpinner
        visible={isCreating || isJoining}
        overlay
        text={isCreating ? 'Creating room...' : 'Joining room...'}
      />

      <CreateRoomSheet visible={showCreateForm} onClose={() => setShowCreateForm(false)} />
      <JoinRoomSheet visible={showJoinForm} onClose={() => setShowJoinForm(false)} />
      {/* <View style={styles.mapPreview}>
        <View style={styles.mapPreviewContainer}>
          <Image
            source={require('@/assets/images/maps/pleasant-park.png')}
            style={styles.mapPreviewImage}
            resizeMode="contain"
          />
          {MAPS[2].hidingSpots.map((spot) => renderHidingSpot(spot, screenWidth, screenHeight))}
        </View>
      </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // mapPreview: {
  //   backgroundColor: 'red',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   width: '100%',
  // },
  // mapPreviewContainer: {
  //   backgroundColor: 'blue',
  //   position: 'relative',
  //   height: 430,
  //   width: '100%',
  // },
  // mapPreviewImage: {
  //   width: '100%',
  //   height: '100%',
  // },
  container: {
    flex: 1,
  },
  scrollView: {
    paddingTop: 16,
    flex: 1,
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 24,
    gap: 16,
  },

  actionButton: {
    flex: 1,
  },

  formCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },

  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },

  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },

  switchLabel: {
    fontSize: 16,
    color: '#495057',
  },

  mapSelector: {
    marginVertical: 16,
  },

  mapLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },

  mapOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  mapButton: {
    marginRight: 8,
    marginBottom: 8,
  },

  roomsList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  roomsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  roomsTitle: {
    fontSize: 20,
    fontWeight: '600',
  },

  noRoomsText: {
    textAlign: 'center',
    color: '#6C757D',
    fontSize: 16,
  },

  errorContainer: {
    backgroundColor: '#F8D7DA',
    borderColor: '#F5C6CB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    margin: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  errorText: {
    color: '#721C24',
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
});

export default LobbyScreen;
