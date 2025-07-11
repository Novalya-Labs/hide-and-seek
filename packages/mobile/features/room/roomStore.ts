import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Env } from '@/constants/Env';
import { createRoom } from './create-room/createRoom';
import { fetchAvailableRooms } from './fetch-available-rooms/fetchAvailableRooms';
import { joinRoom } from './join-room/joinRoom';
import { joinRoomWithCode } from './join-room-with-code/joinRoomWithCode';
import { leaveRoom } from './leave-room/leaveRoom';
import type { RoomState, RoomStore } from './roomTypes';
import { startGame } from './start-game/startGame';

const initialRoomState: RoomState = {
  currentRoom: null,
  availableRooms: [],
  isFetching: false,
  isCreating: false,
  isJoining: false,
  isLeaving: false,
  isStarting: false,
  error: null,
};

export const useRoomStore = create<RoomStore>()(
  persist(
    (set) => {
      return {
        ...initialRoomState,

        fetchAvailableRooms: async (payload) => {
          try {
            set({ isFetching: true });
            const rooms = await fetchAvailableRooms(payload);
            set({ availableRooms: rooms });
          } catch {
            set({ error: 'Failed to fetch available rooms' });
          } finally {
            set({ isFetching: false });
          }
        },

        createRoom: async (payload) => {
          try {
            set({ isCreating: true });
            const room = await createRoom(payload);
            set({ currentRoom: room });
          } catch {
            set({ error: 'Failed to create room' });
          } finally {
            set({ isCreating: false });
          }
        },

        joinRoom: async (payload) => {
          try {
            set({ isJoining: true });
            const room = await joinRoom(payload);
            set({ currentRoom: room });
          } catch {
            set({ error: 'Failed to join room' });
          } finally {
            set({ isJoining: false });
          }
        },

        joinRoomWithCode: async (payload) => {
          try {
            set({ isJoining: true });
            const room = await joinRoomWithCode(payload);
            set({ currentRoom: room });
          } catch {
            set({ error: 'Failed to join room' });
          } finally {
            set({ isJoining: false });
          }
        },

        leaveRoom: async (payload) => {
          try {
            set({ isLeaving: true });
            const room = await leaveRoom(payload);
            set({ currentRoom: room });
          } catch {
            set({ error: 'Failed to leave room' });
          } finally {
            set({ isLeaving: false });
          }
        },

        startGame: async (payload) => {
          try {
            set({ isStarting: true });
            const room = await startGame(payload);
            set({ currentRoom: room });
          } catch {
            set({ error: 'Failed to start game' });
          } finally {
            set({ isStarting: false });
          }
        },

        clearError: () => {
          set({ error: null });
        },

        reset: () => {
          set(initialRoomState);
        },
      };
    },
    {
      name: `room-${Env.APP_SLUG}`,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentRoom: state.currentRoom,
        availableRooms: state.availableRooms,
      }),
    },
  ),
);
