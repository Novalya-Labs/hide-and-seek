import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Text from '@/components/ui/Text';
import { useTheme } from '@/contexts/theme-context';

interface WebViewModalProps {
  url: string;
  isVisible: boolean;
  onClose: () => void;
  title?: string;
}

const WebViewModal: React.FC<WebViewModalProps> = ({ url, isVisible, onClose, title }) => {
  const { top } = useSafeAreaInsets();
  const { isDarkMode } = useTheme();

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible} onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: top, backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          {title && (
            <Text variant="h4" className="font-bold">
              {title}
            </Text>
          )}
          <View style={styles.spacer} />
        </View>

        <WebView source={{ uri: url }} style={styles.webview} startInLoadingState={true} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 8,
  },
  spacer: {
    width: 40,
  },
  webview: {
    flex: 1,
  },
});

export default WebViewModal;
