import type { Map as GameMap } from '@hide-and-seek/shared';

export const MAPS: GameMap[] = [
  {
    id: 'chattatamer',
    name: 'Chatta-Tamer',
    hidingSpots: [
      {
        id: '1',
        name: 'Hiding Spot 1',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        isOccupied: false,
      },
      {
        id: '2',
        name: 'Hiding Spot 2',
        x: 300,
        y: 150,
        width: 100,
        height: 100,
        isOccupied: false,
      },
      {
        id: '3',
        name: 'Hiding Spot 3',
        x: 500,
        y: 200,
        width: 100,
        height: 100,
        isOccupied: false,
      },
    ],
  },
  {
    id: 'clown-city',
    name: 'Clown City',
    hidingSpots: [
      {
        id: '1',
        name: 'Hiding Spot 1',
        x: 150,
        y: 120,
        width: 100,
        height: 100,
        isOccupied: false,
      },
      {
        id: '2',
        name: 'Hiding Spot 2',
        x: 350,
        y: 180,
        width: 100,
        height: 100,
        isOccupied: false,
      },
      {
        id: '3',
        name: 'Hiding Spot 3',
        x: 450,
        y: 250,
        width: 100,
        height: 100,
        isOccupied: false,
      },
    ],
  },
  {
    id: 'pleasant-park',
    name: 'Pleasant Park',
    hidingSpots: [
      {
        id: '1',
        name: 'Hiding Spot 1',
        x: 200,
        y: 100,
        width: 100,
        height: 100,
        isOccupied: false,
      },
      {
        id: '2',
        name: 'Hiding Spot 2',
        x: 400,
        y: 200,
        width: 100,
        height: 100,
        isOccupied: false,
      },
      {
        id: '3',
        name: 'Hiding Spot 3',
        x: 600,
        y: 300,
        width: 100,
        height: 100,
        isOccupied: false,
      },
    ],
  },
];

export const getMapById = (mapId: string): GameMap | undefined => {
  return MAPS.find((map) => map.id === mapId);
};
