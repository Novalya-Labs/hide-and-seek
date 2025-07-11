export const getMapImageSource = (mapId: string) => {
  switch (mapId) {
    case 'pleasant-park':
      return require('@/assets/images/maps/pleasant-park.png');
    case 'clown-city':
      return require('@/assets/images/maps/clown-city.png');
    case 'chattatamer':
      return require('@/assets/images/maps/chattatamer.png');
    default:
      return require('@/assets/images/maps/pleasant-park.png');
  }
};
