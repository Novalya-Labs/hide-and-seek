import type { Player, Room } from '@hide-and-seek/shared';

export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function generateRoomId(counter: number): string {
  return `room_${counter}_${Date.now()}`;
}

export function getEligibleSeekers(players: Player[], previousSeekers: string[]): Player[] {
  return players.filter((p) => p.isAlive && !previousSeekers.includes(p.socketId));
}

export function getRoomStats(room: Room) {
  const alivePlayers = room.players.filter((p) => p.isAlive);
  const hostPlayer = room.players.find((p) => p.isHost);

  return {
    totalPlayers: room.players.length,
    alivePlayers: alivePlayers.length,
    hostName: hostPlayer?.username || 'Unknown',
    mapName: room.map.name,
  };
}
