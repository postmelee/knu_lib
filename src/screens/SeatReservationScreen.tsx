import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useBeaconAuth, useReserveSeat, useReadingRoomSeats } from '../hooks/queries/useSeat';
import { ParsedSeat } from '../api/types/seat';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { textColors } from '../styles/typography';

export const SeatReservationScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ roomId: string, roomName: string, requireBeacon: string }>();
  
  const { roomId, roomName } = params;
  const isBeaconRequired = params.requireBeacon === 'true';
  
  useEffect(() => {
    navigation.setOptions({ title: roomName });
  }, [navigation, roomName]);

  const [step, setStep] = useState(isBeaconRequired ? 'BEACON_AUTH' : 'SEAT_SELECTION');
  const [selectedSeat, setSelectedSeat] = useState<ParsedSeat | null>(null);

  const beaconMutation = useBeaconAuth();
  const reserveMutation = useReserveSeat();
  
  const { data: seats, isLoading: isSeatsLoading } = useReadingRoomSeats(
      // Only fetch seats if we are on the selection step (or you could prefetch)
      step === 'SEAT_SELECTION' ? roomId : ''
  );

  const maxLeft = seats?.reduce((max, seat) => Math.max(max, seat.left), 0) || 1000;
  const maxTop = seats?.reduce((max, seat) => Math.max(max, seat.top), 0) || 600;
  
  // Add some padding to the max dimensions (a seat box is 30px wide, plus some margin)
  const mapWidth = maxLeft + 60;
  const mapHeight = maxTop + 60;

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

    Alert.alert(
      "좌석 예약",
      `${selectedSeat.number}번 좌석을 예약하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        { 
          text: "예약", 
          onPress: () => {
            reserveMutation.mutate(selectedSeat.id, {
                onSuccess: () => {
                    Alert.alert("예약 완료", "좌석이 성공적으로 예약되었습니다!");
                    router.back();
                },
                onError: (error: any) => {
                    Alert.alert("예약 실패", error.message);
                }
            });
          }
        }
      ]
    );
  };

  const isLoading = beaconMutation.isPending || reserveMutation.isPending || isSeatsLoading;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={textColors.blue} />
        </View>
      ) : (
          <View style={styles.content}>
              {step === 'BEACON_AUTH' ? (
                  <View style={styles.authContainer}>
                      <View style={styles.authInfo}>
                          <Text preset="t3Bold" color={textColors.primary} style={styles.authTitle}>
                              도서관 위치 인증
                          </Text>
                          <Text preset="t6Medium" color={textColors.secondary} style={styles.authDesc}>
                              이 열람실은 현장 출석 확인이 필요합니다.{'\n'}
                              휴대폰 블루투스를 켜고 비콘 인증을 진행해주세요.
                          </Text>
                      </View>
                      
                      {beaconMutation.isPending ? (
                          <View style={styles.scanningContainer}>
                              <ActivityIndicator size="large" color={textColors.blue} />
                              <Text preset="t6Medium" color={textColors.secondary} style={styles.scanningText}>
                                  주변 비콘 탐색 중...
                              </Text>
                          </View>
                      ) : (
                          <Button variant="fill" color="primary" size="xlarge" onPress={handleBeaconAuth}>
                             위치 인증하기
                          </Button>
                      )}
                  </View>
              ) : (
                  <View style={styles.selectionContainer}>
                      <View style={styles.selectionHeader}>
                          <Text preset="t4Bold" color={textColors.primary}>좌석 선택</Text>
                          {selectedSeat ? (
                              <Text preset="t5Bold" color={textColors.blue}>
                                  {selectedSeat.number}번 좌석 선택됨
                              </Text>
                          ) : (
                              <Text preset="t6Medium" color={textColors.tertiary}>
                                  원하시는 좌석을 길게 누르거나 탭하세요
                              </Text>
                          )}
                      </View>
                      
                      <ScrollView 
                          horizontal 
                          style={styles.mapContainer}
                          contentContainerStyle={{ minWidth: mapWidth }}
                      >
                          <ScrollView 
                              style={{ minWidth: mapWidth, minHeight: mapHeight }}
                              contentContainerStyle={{ width: mapWidth, height: mapHeight }}
                              maximumZoomScale={3}
                              minimumZoomScale={0.5}
                              bouncesZoom={true}
                              centerContent={true}
                          >
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
                                      <Text preset="t8Bold" color={
                                          selectedSeat?.id === seat.id 
                                              ? textColors.white 
                                              : (seat.isOccupied ? textColors.disabled : textColors.secondary)
                                      }>
                                          {seat.number}
                                      </Text>
                                  </TouchableOpacity>
                              ))}
                          </ScrollView>
                      </ScrollView>

                      <View style={styles.footer}>
                          <Button 
                              variant={selectedSeat ? 'fill' : 'weak'}
                              color={selectedSeat ? 'primary' : 'dark'}
                              size="xlarge"
                              onPress={handleReservation} 
                              disabled={!selectedSeat || reserveMutation.isPending}
                          >
                              {selectedSeat ? `${selectedSeat.number}번 좌석 예약하기` : '좌석을 선택해주세요'}
                          </Button>
                      </View>
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
    backgroundColor: '#ffffff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  
  // -- Auth Step --
  authContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  authInfo: {
    alignItems: 'center',
    marginBottom: 48,
  },
  authTitle: {
    marginBottom: 12,
  },
  authDesc: {
    textAlign: 'center',
    lineHeight: 22,
  },
  scanningContainer: {
    height: 56, // matches Button xlarge size
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    gap: 12,
  },
  scanningText: {
    // text preset applied directly
  },
  
  // -- Selection Step --
  selectionContainer: {
    flex: 1,
    paddingTop: 16,
  },
  selectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  seatBox: {
    position: 'absolute',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  seatOccupied: {
    borderColor: '#f2f4f6',
    backgroundColor: '#f9fafb',
  },
  seatSelected: {
    borderColor: '#3182f6',
    backgroundColor: '#3182f6',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
});
