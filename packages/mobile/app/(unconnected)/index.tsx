import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { AvatarSelector, Button, Input, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/authStore';

const WelcomeScreen: React.FC = () => {
  const { user, login, loading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar_1');

  const handleSignIn = useCallback(async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    try {
      await login({ username: username.trim(), avatar: selectedAvatar });
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in');
    }
  }, [login, username, selectedAvatar]);

  if (user && loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.subtitle}>Connecting to game server...</Text>

          <ActivityIndicator />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitle}>A real-time multiplayer hide-and-seek game</Text>

        <View style={styles.authCard}>
          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />

          <AvatarSelector selectedAvatar={selectedAvatar} onAvatarSelect={setSelectedAvatar} />

          <View style={{ marginTop: 24 }} />

          <Button
            label="Start Playing"
            onPress={handleSignIn}
            loading={loading}
            disabled={loading || !username.trim()}
            size="large"
          />
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Game Features</Text>
          <Text style={styles.feature}>• Real-time multiplayer gameplay</Text>
          <Text style={styles.feature}>• Multiple themed maps</Text>
          <Text style={styles.feature}>• Hide and seek battle royale</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 24,
    borderRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 32,
    textAlign: 'center',
  },
  authCard: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 32,
  },
  features: {
    alignItems: 'center',
  },

  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },

  feature: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
});

export default WelcomeScreen;
