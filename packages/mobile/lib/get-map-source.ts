export const getMapImageSource = (imageName: string) => {
  switch (imageName) {
    case 'pleasant-park.png':
      return require('@/assets/images/maps/pleasant-park.png');
    case 'clown-city.png':
      return require('@/assets/images/maps/clown-city.png');
    case 'chattatamer.png':
      return require('@/assets/images/maps/chattatamer.png');
    default:
      return require('@/assets/images/maps/pleasant-park.png');
  }
};
