import type { HidingSpot } from '@hide-and-seek/shared';

export const MAPS = [
  {
    id: 'chattatamer',
    name: 'Chatta-Tamer',
    image: require('@/assets/images/maps/chattatamer.png'),
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
    ] as HidingSpot[],
  },
  {
    id: 'clown-city',
    name: 'Clown City',
    image: require('@/assets/images/maps/clown-city.png'),
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
    ] as HidingSpot[],
  },
  {
    id: 'pleasant-park',
    name: 'Pleasant Park',
    image: require('@/assets/images/maps/pleasant-park.png'),
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
    ] as HidingSpot[],
  },
];
