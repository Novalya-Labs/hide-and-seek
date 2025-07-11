import { Platform, Switch as RNSwitch, type SwitchProps as RNSwitchProps, StyleSheet } from 'react-native';

interface SwitchProps extends Omit<RNSwitchProps, 'trackColor' | 'thumbColor'> {
  /**
   * Color when the switch is enabled (active)
   * @default 'yellow-400'
   */
  activeColor?: string;

  /**
   * Color when the switch is disabled (inactive)
   * @default 'gray-200' (light mode) or 'gray-700' (dark mode)
   */
  inactiveColor?: string;

  /**
   * Thumb color when enabled
   * @default 'white'
   */
  activeThumbColor?: string;

  /**
   * Thumb color when disabled
   * @default 'white'
   */
  inactiveThumbColor?: string;
}

const Switch: React.FC<SwitchProps> = ({
  activeColor = 'yellow-400',
  inactiveColor,
  activeThumbColor = 'white',
  inactiveThumbColor = 'white',
  ...props
}) => {
  return (
    <RNSwitch
      trackColor={{
        false: inactiveColor || activeThumbColor,
        true: activeColor,
      }}
      thumbColor={props.value ? activeThumbColor : inactiveThumbColor}
      ios_backgroundColor={inactiveColor || activeThumbColor}
      style={Platform.OS === 'android' ? styles.androidSwitch : undefined}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  androidSwitch: {
    // Fix Android switch styling issues if needed
  },
});

export default Switch;
