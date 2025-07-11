import { ToastPosition, toast } from '@backpackapp-io/react-native-toast';
import { CheckIcon, XIcon } from 'lucide-react-native';
import { useCallback } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/contexts/theme-context';

export interface NotificationService {
  notify(options: NotificationOptionsProps): Promise<void>;
  dismiss(): Promise<void>;
}

export interface NotificationOptionsProps {
  type: NotificationType;
  message: string;
  duration?: number;
  position?: ToastPosition;
}

export type NotificationType = 'success' | 'error';

const DEFAULT_TOAST_DURATION = 5000;
const DEFAULT_TOAST_POSITION = ToastPosition.TOP;

export const useNotification = (): NotificationService => {
  const { isDarkMode } = useTheme();

  const notify = useCallback(async (options: NotificationOptionsProps): Promise<void> => {
    toast.dismiss();

    if (options.type === 'error') {
      toast.error(options.message, {
        duration: options.duration ?? DEFAULT_TOAST_DURATION,
        position: options.position ?? DEFAULT_TOAST_POSITION,
        icon: (
          <View
            testID="error-icon-container"
            style={{
              backgroundColor: 'red',
              borderRadius: 999,
              width: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <XIcon color="#242C32" size={13} strokeWidth={4} />
          </View>
        ),
        styles: {
          indicator: { display: 'none' },
          text: { marginLeft: 10, fontWeight: 'bold', fontSize: 14, color: isDarkMode ? '#FFFFFF' : '#000000' },
          view: { backgroundColor: isDarkMode ? '#242C32' : '#FFFFFF', borderRadius: 6 },
        },
      });
    }

    if (options.type === 'success') {
      toast.success(options.message, {
        duration: options.duration ?? DEFAULT_TOAST_DURATION,
        position: options.position ?? DEFAULT_TOAST_POSITION,
        icon: (
          <View
            testID="success-icon-container"
            style={{
              backgroundColor: '#00DF80',
              borderRadius: 999,
              width: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CheckIcon color="#242C32" size={13} strokeWidth={4} />
          </View>
        ),
        styles: {
          indicator: { display: 'none' },
          text: { marginLeft: 10, fontWeight: 'bold', fontSize: 14, color: isDarkMode ? '#FFFFFF' : '#000000' },
          view: { backgroundColor: isDarkMode ? '#242C32' : '#FFFFFF', borderRadius: 6 },
        },
      });
    }
    return Promise.resolve();
  }, [isDarkMode]);

  const dismiss = useCallback(async (): Promise<void> => {
    toast.dismiss();
    return Promise.resolve();
  }, []);

  return { notify, dismiss };
};

export const notificationService: NotificationService = {
  async notify(options: NotificationOptionsProps): Promise<void> {
    toast.dismiss();

    const textColor = '#FFFFFF';

    if (options.type === 'error') {
      toast.error(options.message, {
        duration: options.duration ?? DEFAULT_TOAST_DURATION,
        position: options.position ?? DEFAULT_TOAST_POSITION,
        icon: (
          <View
            testID="error-icon-container"
            style={{
              backgroundColor: 'red',
              borderRadius: 999,
              width: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <XIcon color="#242C32" size={13} strokeWidth={4} />
          </View>
        ),
        styles: {
          indicator: { display: 'none' },
          text: { marginLeft: 10, fontWeight: 'bold', fontSize: 14, color: textColor },
          view: { backgroundColor: '#242C32', borderRadius: 6 },
        },
      });
    }

    if (options.type === 'success') {
      toast.success(options.message, {
        duration: options.duration ?? DEFAULT_TOAST_DURATION,
        position: options.position ?? DEFAULT_TOAST_POSITION,
        icon: (
          <View
            testID="success-icon-container"
            style={{
              backgroundColor: '#00DF80',
              borderRadius: 999,
              width: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CheckIcon color="#242C32" size={13} strokeWidth={4} />
          </View>
        ),
        styles: {
          indicator: { display: 'none' },
          text: { marginLeft: 10, fontWeight: 'bold', fontSize: 14, color: textColor },
          view: { backgroundColor: '#242C32', borderRadius: 6 },
        },
      });
    }
    return Promise.resolve();
  },

  async dismiss(): Promise<void> {
    toast.dismiss();
    return Promise.resolve();
  },
};
