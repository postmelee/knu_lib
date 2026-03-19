import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { textColors } from '../styles/typography';
import { ReadingRoom } from '../api/types/seat';

interface ReadingRoomCardProps {
  room: ReadingRoom;
  onPress: (room: ReadingRoom) => void;
}

export const ReadingRoomCard: React.FC<ReadingRoomCardProps> = ({ room, onPress }) => {
  const count = parseInt(room.l_count as any, 10) || 0;
  const occupied = parseInt(room.l_occupied as any, 10) || 0;
  const available = Math.max(0, count - occupied);
  const isFull = count > 0 && available === 0;
  const occupancyPercentage = count > 0 ? (occupied / count) * 100 : 0;
  return (
    <TouchableOpacity 
      style={[styles.card, isFull && styles.cardFull]} 
      onPress={() => onPress(room)}
      disabled={isFull}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text preset="t4Bold" color={textColors.primary} style={styles.roomNameFlex}>
          {room.l_room_name}
        </Text>
        {(room.l_flag_beacon_validation === "1" || room.l_flag_beacon_validation === 1) ? (
            <View style={styles.badge}>
                <Text preset="t7Bold" color={textColors.blue}>Beacon</Text>
            </View>
        ) : null}
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statsHeader}>
          <Text preset="t7Medium" color={textColors.secondary}>
            {occupied} / {count}
          </Text>
          <View style={styles.availableBadge}>
            {!isFull && (
              <Text preset="t7Medium" color={textColors.tertiary}>
                잔여좌석:
              </Text>
            )}
            <Text preset="t6Bold" color={isFull ? textColors.red : textColors.blue}>
              {isFull ? '만석' : `${available}석`}
            </Text>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[
            styles.progressBarFill, 
            { width: `${occupancyPercentage}%`, backgroundColor: isFull ? textColors.red : textColors.blue }
          ]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardFull: {
    opacity: 0.5,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  roomNameFlex: {
    flex: 1,
    marginRight: 12,
  },
  badge: {
    backgroundColor: '#e8f3ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statsContainer: {
    marginTop: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
  },
});
