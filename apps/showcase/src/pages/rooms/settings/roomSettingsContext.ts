import { createContext, useContext } from 'react';
import type { RoomDetail } from '../../../features/rooms/types';

export type RoomSettingsContextValue = {
  room: RoomDetail;
  roomId: string;
};

export const RoomSettingsContext =
  createContext<RoomSettingsContextValue | null>(null);

export function useRoomSettingsContext() {
  const context = useContext(RoomSettingsContext);

  if (!context) {
    throw new Error(
      'useRoomSettingsContext must be used within a RoomSettingsProvider',
    );
  }

  return context;
}
