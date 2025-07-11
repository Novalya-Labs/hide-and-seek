import { useColorScheme as useColorSchemeNativewind } from 'nativewind';
import type React from 'react';
import { createContext, type ReactNode, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAuthStore } from '@/features/auth/authStore';

interface ThemeContextType {
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { setColorScheme } = useColorSchemeNativewind();
  const colorScheme = useColorScheme();
  const { theme } = useAuthStore();

  const isDarkMode = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');

  useEffect(() => {
    setColorScheme(theme === 'light' ? 'light' : theme === 'dark' ? 'dark' : 'system');
  }, [theme, setColorScheme]);

  return <ThemeContext.Provider value={{ isDarkMode }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { theme, setTheme } = useAuthStore();

  return {
    theme,
    isDarkMode,
    setTheme,
  };
};

export default ThemeContext;
