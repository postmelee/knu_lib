import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from './Text';
import { textColors } from '../styles/typography';
import { ParsedSeat } from '../api/types/seat';

export interface SeatItemProps {
  seat: ParsedSeat;
  isSelected: boolean;
  onPress: (seat: ParsedSeat) => void;
  scaledLeft: number;
  scaledTop: number;
  seatSize: number;
}

export const SeatItem = memo(({ seat, isSelected, onPress, scaledLeft, scaledTop, seatSize }: SeatItemProps) => {
  return (
    <TouchableOpacity
        style={[
            styles.seatBox,
            { left: scaledLeft, top: scaledTop, width: seatSize, height: seatSize },
            seat.isOccupied && styles.seatOccupied,
            isSelected && styles.seatSelected
        ]}
        disabled={seat.isOccupied}
        onPress={() => onPress(seat)}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
    >
        <Text preset="t8Bold" color={
            isSelected 
                ? textColors.white 
                : (seat.isOccupied ? textColors.disabled : textColors.secondary)
        }>
            {seat.number}
        </Text>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.onPress === nextProps.onPress &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.seat.isOccupied === nextProps.seat.isOccupied &&
    prevProps.scaledLeft === nextProps.scaledLeft &&
    prevProps.scaledTop === nextProps.scaledTop &&
    prevProps.seatSize === nextProps.seatSize
  );
});

const styles = StyleSheet.create({
  seatBox: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E8EB',
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  seatOccupied: {
    backgroundColor: '#F2F4F6',
    borderColor: '#DFE3E6',
    shadowOpacity: 0,
    elevation: 0,
  },
  seatSelected: {
    backgroundColor: textColors.blue,
    borderColor: textColors.blue,
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
    shadowColor: textColors.blue,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  }
});
