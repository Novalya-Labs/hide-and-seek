import type { HidingSpot } from '@hide-and-seek/shared';
import { MAPS } from '@/constants/Maps';

export const getHidingSpots = (mapId: string): HidingSpot[] => {
  const map = MAPS.find((map) => map.id === mapId);

  if (!map) {
    throw new Error('Map not found');
  }

  return map.hidingSpots;
};
