import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ReadingRoom } from '../api/seatApi';

interface ReadingRoomCardProps {
  room: ReadingRoom;
  onPress: (room: ReadingRoom) => void;
}

export const ReadingRoomCard: React.FC<ReadingRoomCardProps> = ({ room, onPress }) => {
  const isFull = room.l_occupied >= room.l_count;
  const occupancyPercentage = room.l_count > 0 ? (room.l_occupied / room.l_count) * 100 : 0;
  return (
    <TouchableOpacity 
      style={[styles.card, isFull && styles.cardFull]} 
      onPress={() => onPress(room)}
      disabled={isFull}
    >
      <View style={styles.header}>
        <Text style={styles.roomName}>{room.l_room_name}</Text>
        {room.l_flag_beacon_validation === "1" || room.l_flag_beacon_validation === 1 ? (
            <View style={styles.badge}>
                <Text style={styles.badgeText}>Beacon Auth Req.</Text>
            </View>
        ) : null}
      </View>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {room.l_occupied} / {room.l_count} Available
        </Text>
        <Text style={styles.percentageText}>
          {occupancyPercentage.toFixed(1)}% Full
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardFull: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  percentageText: {
    fontSize: 14,
    color: '#e53935',
    fontWeight: '600',
  },
});
