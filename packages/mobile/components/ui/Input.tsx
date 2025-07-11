import type React from 'react';
import { forwardRef, useState } from 'react';
import {
  type NativeSyntheticEvent,
  TextInput,
  type TextInputFocusEventData,
  type TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '@/contexts/theme-context';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  /**
   * Input label
   */
  label?: string;

  /**
   * Helper text shown below input
   */
  helperText?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Right icon
   */
  rightIcon?: React.ReactNode;

  /**
   * Left icon
   */
  leftIcon?: React.ReactNode;

  /**
   * Input appearance
   * @default 'filled'
   */
  variant?: 'outline' | 'filled';

  /**
   * Handler for right icon press
   */
  onRightIconPress?: () => void;
}

/**
 * Input component for text entry
 */
export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      helperText,
      error,
      rightIcon,
      leftIcon,
      variant = 'filled',
      onRightIconPress,
      className,
      style,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const { isDarkMode } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Base classes for the input container
    const baseContainerClass = 'rounded-xl w-full';

    // Variant classes
    const variantClasses = {
      outline: 'border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700',
      filled: 'bg-gray-100 dark:bg-gray-900 dark:border-gray-700',
    };

    // Status classes (focused, error)
    const statusClass = error ? 'border-red-500' : isFocused ? 'border-blue-500' : '';

    // Input container class combining all styles
    const containerClass = twMerge(baseContainerClass, variantClasses[variant], statusClass, className);

    // Base input class
    const inputClass = 'px-4 py-4 text-base text-black leading-tight dark:text-white';

    // Adjust padding if we have icons
    const inputPaddingClass = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <View>
        {label && (
          <Text variant="label" className="mb-1 ml-1">
            {label}
          </Text>
        )}

        <View className="relative">
          <View className={containerClass}>
            {leftIcon && <View className="absolute left-3 top-0 bottom-0 justify-center z-10">{leftIcon}</View>}

            <TextInput
              ref={ref}
              className={twMerge(inputClass, inputPaddingClass)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
              style={style}
              {...props}
            />

            {rightIcon && (
              <TouchableOpacity
                className="absolute right-3 top-0 bottom-0 justify-center z-10"
                onPress={onRightIconPress}
                disabled={!onRightIconPress}
              >
                {rightIcon}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {(helperText || error) && (
          <Text variant="body-sm" color={error ? 'text-red-500' : 'text-gray-500'} className="mt-1 ml-1">
            {error || helperText}
          </Text>
        )}
      </View>
    );
  },
);
