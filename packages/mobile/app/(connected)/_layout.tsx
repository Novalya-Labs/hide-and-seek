import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/authStore';

const ConnectedLayout: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/');
    }
  }, [user, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="lobby/index" />
      <Stack.Screen name="lobby/waiting" />
      <Stack.Screen name="game" />
    </Stack>
  );
};

export default ConnectedLayout;
