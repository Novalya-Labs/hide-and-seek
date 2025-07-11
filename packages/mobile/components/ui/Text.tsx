import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

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
  const variantClasses = {
    h1: 'text-4xl leading-tight',
    h2: 'text-3xl leading-tight',
    h3: 'text-2xl leading-tight',
    h4: 'text-xl leading-snug',
    body: 'text-base leading-normal',
    'body-sm': 'text-sm leading-normal',
    label: 'text-base leading-tight',
  };

  const defaultColors = {
    h1: 'dark:text-white text-black',
    h2: 'dark:text-white text-black',
    h3: 'dark:text-white text-black',
    h4: 'dark:text-white text-black',
    body: 'dark:text-white text-black',
    'body-sm': 'dark:text-white text-black',
    label: 'dark:text-white text-black',
  };

  const alignmentClass = center ? 'text-center' : '';

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
