import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useBeaconAuth, useReserveSeat, useReadingRoomSeats } from '../hooks/queries/useSeat';
import { ParsedSeat } from '../api/types/seat';
import { useLocalSearchParams, useRouter } from 'expo-router';

export const SeatReservationScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ roomId: string, roomName: string, requireBeacon: string }>();
  
  const { roomId, roomName } = params;
  const isBeaconRequired = params.requireBeacon === 'true';
  
  const [step, setStep] = useState(isBeaconRequired ? 'BEACON_AUTH' : 'SEAT_SELECTION');
  const [selectedSeat, setSelectedSeat] = useState<ParsedSeat | null>(null);

  const beaconMutation = useBeaconAuth();
  const reserveMutation = useReserveSeat();
  
  const { data: seats, isLoading: isSeatsLoading } = useReadingRoomSeats(
      // Only fetch seats if we are on the selection step (or you could prefetch)
      step === 'SEAT_SELECTION' ? roomId : ''
  );

  const handleBeaconAuth = () => {
      beaconMutation.mutate(undefined, {
          onSuccess: () => {
              Alert.alert("위치 확인 완료", "현재 위치가 확인되었습니다.");
              setStep('SEAT_SELECTION');
          },
          onError: (error: any) => {
              Alert.alert("위치 확인 실패", error.message);
          }
      });
  };

  const handleSeatPress = (seat: ParsedSeat) => {
      if (seat.isOccupied) {
          Alert.alert("사용 중", "이 좌석은 현재 사용 중입니다.");
          return;
      }
      setSelectedSeat(seat);
  };

  const handleReservation = () => {
    if (!selectedSeat) {
      Alert.alert("오류", "좌석을 선택해주세요.");
      return;
    }

    reserveMutation.mutate(selectedSeat.id, {
        onSuccess: () => {
            Alert.alert("예약 완료", "좌석이 성공적으로 예약되었습니다!");
            router.back();
        },
        onError: (error: any) => {
            Alert.alert("예약 실패", error.message);
        }
    });
  };

  const isLoading = beaconMutation.isPending || reserveMutation.isPending || isSeatsLoading;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{roomName}</Text>
      
      {isLoading ? (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
          <View style={styles.content}>
              {step === 'BEACON_AUTH' ? (
                  <View style={styles.card}>
                      <Text style={styles.cardTitle}>위치 확인 필요</Text>
                      <Text style={styles.cardDesc}>
                          이 열람실은 현장 출석 확인이 필요합니다. 아래 버튼을 눌러 위치를 인증해주세요.
                      </Text>
                      <Button title="위치 인증하기" onPress={handleBeaconAuth} color="#1976d2" />
                  </View>
              ) : (
                  <View style={styles.card}>
                      <Text style={styles.cardTitle}>좌석 선택</Text>
                      {selectedSeat && (
                          <Text style={styles.selectedSeatText}>
                              선택됨: {selectedSeat.number}번 좌석
                          </Text>
                      )}
                      
                      <ScrollView horizontal style={styles.mapContainer}>
                          <ScrollView style={{ minWidth: 1000, minHeight: 600 }}>
                              {seats?.map(seat => (
                                  <TouchableOpacity
                                      key={seat.id}
                                      style={[
                                          styles.seatBox,
                                          { left: seat.left, top: seat.top },
                                          seat.isOccupied && styles.seatOccupied,
                                          selectedSeat?.id === seat.id && styles.seatSelected
                                      ]}
                                      disabled={seat.isOccupied}
                                      onPress={() => handleSeatPress(seat)}
                                  >
                                      <Text style={[
                                          styles.seatText,
                                          seat.isOccupied && styles.seatTextOccupied
                                      ]}>
                                          {seat.number}
                                      </Text>
                                  </TouchableOpacity>
                              ))}
                          </ScrollView>
                      </ScrollView>

                      <Button 
                          title={`${selectedSeat ? selectedSeat.number + '번 좌석 ' : ''}예약하기`} 
                          onPress={handleReservation} 
                          color="#2e7d32" 
                          disabled={!selectedSeat || reserveMutation.isPending}
                      />
                  </View>
              )}
          </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  selectedSeatText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 10,
  },
  mapContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fafafa'
  },
  seatBox: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4caf50',
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
  },
  seatOccupied: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
    opacity: 0.7,
  },
  seatSelected: {
    borderColor: '#1976d2',
    backgroundColor: '#1976d2',
  },
  seatText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#388e3c',
  },
  seatTextOccupied: {
    color: '#d32f2f',
  }
});
