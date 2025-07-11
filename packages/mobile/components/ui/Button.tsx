import * as Haptic from 'expo-haptics';
import type React from 'react';
import { ActivityIndicator, TouchableOpacity, type TouchableOpacityProps, View } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { Text } from './Text';

export interface ButtonProps extends TouchableOpacityProps {
  /**
   * Button variant style
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'link' | 'destructive';

  /**
   * Button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Button content/label
   */
  label?: string;

  /**
   * Show loading spinner
   * @default false
   */
  loading?: boolean;

  /**
   * Icon to display before label
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon to display after label
   */
  rightIcon?: React.ReactNode;

  /**
   * Haptic feedback
   * @default undefined
   */
  haptic?: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';

  /**
   * Text color
   * @default undefined
   */
  classNameText?: string;
}

/**
 * Primary UI component for user interaction
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  classNameText,
  size = 'medium',
  label,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  style,
  haptic,
  ...props
}) => {
  // Base classes that apply to all buttons
  const baseClass = 'items-center justify-center rounded-xl flex-row active:scale-95';

  // Size classes
  const sizeClasses = {
    small: 'py-2 px-3',
    medium: 'py-3 px-4',
    large: 'py-4 px-6',
  };

  // Variant classes (background, text color, etc.)
  const variantClasses = {
    primary: 'bg-primary-500 active:bg-primary-600 dark:bg-primary-900 dark:active:bg-primary-800',
    secondary: 'bg-secondary-50 dark:bg-secondary-900',
    outline: 'bg-transparent border border-primary-600 dark:border-primary-400',
    link: 'bg-transparent',
    destructive: 'bg-red-500 active:bg-red-600 dark:bg-red-900 dark:active:bg-red-800',
  };

  // Text color classes based on variant
  const textClasses = {
    primary: 'text-white',
    secondary: 'text-black dark:text-white',
    outline: 'text-primary-800',
    link: 'text-black',
    destructive: 'text-white',
  };

  // Disabled state
  const disabledClass = disabled ? 'opacity-50' : '';

  // Combine all classes
  const buttonClass = twMerge(baseClass, sizeClasses[size], variantClasses[variant], disabledClass, className);

  const textClass = twMerge(
    textClasses[variant],
    size === 'small' ? 'text-sm' : 'text-base',
    size === 'large' ? 'text-lg' : '',
  );

  return (
    <TouchableOpacity
      className={buttonClass}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={style}
      onPressIn={async () => {
        if (haptic) {
          await Haptic.impactAsync(haptic as Haptic.ImpactFeedbackStyle);
        }
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'link' ? '#000' : '#fff'}
          className={label ? 'mr-2' : 'mr-0'}
        />
      ) : leftIcon ? (
        <View className={label ? 'mr-2' : 'mr-0'}>{leftIcon}</View>
      ) : null}

      {label ? (
        <Text className={twMerge(textClass, classNameText)} weight="bold">
          {label}
        </Text>
      ) : (
        children
      )}

      {rightIcon && !loading && <View className={label ? 'ml-2' : 'ml-0'}>{rightIcon}</View>}
    </TouchableOpacity>
  );
};
