import { Image, type ImageSourcePropType, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

interface PlayerAvatarProps {
  avatar?: string;
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ avatar = 'avatar_1', size = 'small', style }) => {
  const getAvatarSource = (avatarName: string) => {
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
    return avatarMap[avatarName] || avatarMap.avatar_1;
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32 };
      case 'medium':
        return { width: 48, height: 48 };
      case 'large':
        return { width: 64, height: 64 };
      default:
        return { width: 32, height: 32 };
    }
  };

  return (
    <View style={[styles.container, getSizeStyles(), style]}>
      <Image source={getAvatarSource(avatar)} style={[styles.avatar, getSizeStyles()]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
  },

  avatar: {
    borderRadius: 5,
  },
});
