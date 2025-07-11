import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/authStore';
import { useGameEvents } from '@/hooks/useGameEvents';
import { useRoomEvents } from '@/hooks/useRoomEvents';

const ConnectedLayout: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();

  useRoomEvents();
  useGameEvents();

  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="lobby/index" />
      <Stack.Screen name="lobby/waiting" />
      <Stack.Screen name="game/index" options={{ animation: 'fade' }} />
    </Stack>
  );
};

export default ConnectedLayout;
