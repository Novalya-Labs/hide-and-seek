import type React from 'react';
import { Image, type ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AVATARS } from '@/constants/Avatars';

interface AvatarSelectorProps {
  selectedAvatar?: string;
  onAvatarSelect: (avatar: string) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selectedAvatar, onAvatarSelect }) => {
  const getAvatarSource = (avatar: string) => {
    const avatarMap: { [key: string]: ImageSourcePropType } = {
      avatar_1: require('@/assets/images/avatars/avatar_1.png'),
      avatar_2: require('@/assets/images/avatars/avatar_2.png'),
      avatar_3: require('@/assets/images/avatars/avatar_3.png'),
      avatar_4: require('@/assets/images/avatars/avatar_4.png'),
      avatar_5: require('@/assets/images/avatars/avatar_5.png'),
      avatar_6: require('@/assets/images/avatars/avatar_6.png'),
      avatar_7: require('@/assets/images/avatars/avatar_7.png'),
      avatar_8: require('@/assets/images/avatars/avatar_8.png'),
      avatar_9: require('@/assets/images/avatars/avatar_9.png'),
      avatar_10: require('@/assets/images/avatars/avatar_10.png'),
      avatar_11: require('@/assets/images/avatars/avatar_11.png'),
      avatar_12: require('@/assets/images/avatars/avatar_12.png'),
      avatar_13: require('@/assets/images/avatars/avatar_13.png'),
      avatar_14: require('@/assets/images/avatars/avatar_14.png'),
      avatar_15: require('@/assets/images/avatars/avatar_15.png'),
      avatar_16: require('@/assets/images/avatars/avatar_16.png'),
      avatar_17: require('@/assets/images/avatars/avatar_17.png'),
      avatar_18: require('@/assets/images/avatars/avatar_18.png'),
      avatar_19: require('@/assets/images/avatars/avatar_19.png'),
    };
    return avatarMap[avatar];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choose Avatar (Optional)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.avatarGrid}>
          {AVATARS.map((avatar) => (
            <Pressable
              key={avatar}
              style={[styles.avatarContainer, selectedAvatar === avatar && styles.selectedAvatar]}
              onPress={() => onAvatarSelect(avatar)}
            >
              <Image source={getAvatarSource(avatar)} style={styles.avatarImage} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },

  scrollView: {
    maxHeight: 138,
  },

  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 4,
  },

  avatarContainer: {
    width: 128,
    height: 128,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    padding: 2,
    backgroundColor: '#FFFFFF',
  },

  selectedAvatar: {
    borderColor: '#007BFF',
    backgroundColor: '#E3F2FD',
  },

  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 3,
  },
});
