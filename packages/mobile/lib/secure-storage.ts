import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

// Create a secure storage adapter for Zustand persistence
export const secureStorage: StateStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item;
    } catch (error) {
      console.error('Error getting item from secure storage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting item in secure storage:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing item from secure storage:', error);
    }
  },
};
