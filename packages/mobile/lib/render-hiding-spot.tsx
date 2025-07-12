import type { HidingSpot } from '@hide-and-seek/shared';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export const renderHidingSpot = (spot: HidingSpot, screenWidth: number, screenHeight: number) => {
  return (
    <TouchableOpacity
      key={spot.id}
      style={[
        styles.hidingSpot,
        {
          left: (spot.x / 800) * screenWidth * 0.9,
          top: (spot.y / 600) * screenHeight * 0.4,
          width: (spot.width / 800) * screenWidth * 0.9,
          height: (spot.height / 600) * screenHeight * 0.4,
          backgroundColor: '#e0e0e0',
          borderRadius: 10,
        },
      ]}
      onPress={() => console.log(spot.id)}
    >
      <Text style={styles.spotText}>{spot.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  hidingSpot: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
    zIndex: 10,
  },
  spotText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  checkedIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
