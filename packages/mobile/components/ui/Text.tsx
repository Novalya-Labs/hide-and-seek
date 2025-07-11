import type React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '@/contexts/theme-context';

export interface TextProps extends RNTextProps {
  /**
   * Text variant style
   * @default 'body'
   */
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-sm' | 'label';

  /**
   * Text weight
   * @default 'regular'
   */
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

  /**
   * Text color
   * @default Uses the variant's default color
   */
  color?: string;

  /**
   * Center text
   * @default false
   */
  center?: boolean;
}

/**
 * Typography component for consistent text styling
 */
export const Text: React.FC<TextProps> = ({
  variant = 'body',
  weight = 'regular',
  color,
  center = false,
  children,
  className,
  style,
  ...props
}) => {
  const { isDarkMode } = useTheme();
  // Base variant styles with sizes and line heights
  const variantClasses = {
    h1: 'text-4xl leading-tight',
    h2: 'text-3xl leading-tight',
    h3: 'text-2xl leading-tight',
    h4: 'text-xl leading-snug',
    body: 'text-base leading-normal',
    'body-sm': 'text-sm leading-normal',
    label: 'text-base leading-tight',
  };

  // Default variant colors if no color is specified
  const defaultColors = {
    h1: isDarkMode ? 'text-white' : 'text-black',
    h2: isDarkMode ? 'text-white' : 'text-black',
    h3: isDarkMode ? 'text-white' : 'text-black',
    h4: isDarkMode ? 'text-white' : 'text-black',
    body: isDarkMode ? 'text-white' : 'text-black',
    'body-sm': isDarkMode ? 'text-white' : 'text-black',
    label: isDarkMode ? 'text-white' : 'text-black',
  };

  // Text alignment
  const alignmentClass = center ? 'text-center' : '';

  // Custom color class if provided
  const colorClass = color || defaultColors[variant];

  const fontFamily = (weight: string) => {
    switch (weight) {
      case 'light':
        return 'RobotoLight';
      case 'regular':
        return 'RobotoRegular';
      case 'medium':
        return 'RobotoMedium';
      case 'semibold':
        return 'RobotoSemiBold';
      case 'bold':
        return 'RobotoBold';
      default:
        return 'RobotoRegular';
    }
  };

  // Combine all classes
  const textClass = twMerge(variantClasses[variant], colorClass, alignmentClass);

  return (
    <RNText {...props} className={`${textClass} ${className}`} style={[{ fontFamily: fontFamily(weight) }, style]}>
      {children}
    </RNText>
  );
};
