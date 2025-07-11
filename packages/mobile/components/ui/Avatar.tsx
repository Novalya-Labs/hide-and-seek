import type React from 'react';
import { Image, type ImageSourcePropType, type ImageStyle, type StyleProp, View, type ViewStyle } from 'react-native';
import { twMerge } from 'tailwind-merge';
import Text from './Text';

interface AvatarProps {
  imageUri?: string;
  imageSource?: ImageSourcePropType;
  username: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  className?: string;
}

const sizeClasses = {
  small: 'w-8 h-8',
  medium: 'w-12 h-12',
  large: 'w-16 h-16',
};

const textSizes = {
  small: 'body-sm',
  medium: 'body-sm',
  large: 'body',
} as const;

const Avatar: React.FC<AvatarProps> = ({ imageUri, imageSource, username, size = 'medium', style, className }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const baseClasses = twMerge(
    'rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center overflow-hidden',
    sizeClasses[size],
    className,
  );

  if (imageUri || imageSource) {
    return (
      <Image
        source={imageSource || { uri: imageUri }}
        style={style as StyleProp<ImageStyle>}
        className={baseClasses}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={style} className={baseClasses}>
      <Text variant={textSizes[size]} weight="semibold" className="text-gray-600 dark:text-gray-300">
        {getInitials(username)}
      </Text>
    </View>
  );
};

export default Avatar;
