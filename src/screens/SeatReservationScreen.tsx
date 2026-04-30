import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAutoBeaconAuth, useReserveSeat, useReadingRoomSeats } from '../hooks/queries/useSeat';
import { useQueryClient } from '@tanstack/react-query';
import { ParsedSeat } from '../api/types/seat';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Text } from '../components/Text';
import { Button } from '../components/Button';
import { textColors } from '../styles/typography';

import { SeatItem } from '../components/SeatItem';
import { useSeatMapLayout } from '../hooks/useSeatMapLayout';
import { getSeatAssignmentTimeRange } from '../utils/dateUtils';
import { prepareBeaconScanPermissions } from '../services/beaconService';

export const SeatReservationScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ roomId: string, roomName: string, requireBeacon: string }>();
  
  const { roomId, roomName } = params;
  const isBeaconRequired = params.requireBeacon === 'true';
  
  useEffect(() => {
    navigation.setOptions({ title: roomName });
  }, [navigation, roomName]);

  const [selectedSeat, setSelectedSeat] = useState<ParsedSeat | null>(null);
  const [isBeaconPermissionReady, setIsBeaconPermissionReady] = useState(!isBeaconRequired);
  const [isPreparingBeaconPermission, setIsPreparingBeaconPermission] = useState(false);

  const reserveMutation = useReserveSeat();
  const autoBeacon = useAutoBeaconAuth(isBeaconRequired && isBeaconPermissionReady);
  
  const { data: seats, isLoading: isSeatsLoading } = useReadingRoomSeats(roomId);
  const isBeaconChecking = isBeaconRequired && (isPreparingBeaconPermission || autoBeacon.isLoading);
  const isBeaconViewOnly = isBeaconRequired && autoBeacon.isError;

  const prepareBeaconPermission = useCallback(async () => {
    if (!isBeaconRequired) {
      setIsBeaconPermissionReady(true);
      return;
    }

    setIsBeaconPermissionReady(false);
    setIsPreparingBeaconPermission(true);
    try {
      const permitted = await prepareBeaconScanPermissions();
      if (!permitted) {
        Alert.alert(
          "권한 필요",
          "도서관 위치 인증을 위해 블루투스 및 위치 권한이 필요합니다.",
          [
            { text: "다시 시도", onPress: prepareBeaconPermission },
            { text: "뒤로 가기", style: "cancel", onPress: () => router.back() },
          ]
        );
        return;
      }
      setIsBeaconPermissionReady(true);
    } catch (error: any) {
      Alert.alert(
        "권한 확인 실패",
        error?.message || "블루투스 및 위치 권한을 확인하지 못했습니다.",
        [
          { text: "다시 시도", onPress: prepareBeaconPermission },
          { text: "뒤로 가기", style: "cancel", onPress: () => router.back() },
        ]
      );
    } finally {
      setIsPreparingBeaconPermission(false);
    }
  }, [isBeaconRequired, router]);

  useEffect(() => {
    prepareBeaconPermission();
  }, [prepareBeaconPermission]);

  useEffect(() => {
    if (autoBeacon.isError) {
      Alert.alert(
        "도서관 밖이신가요?", 
        autoBeacon.error?.message || "위치 인증에 실패했습니다. 열람실 안에서 다시 시도해주세요.",
        [{ text: "확인" }]
      );
    }
  }, [autoBeacon.isError, autoBeacon.error]);

  const handleSeatPress = useCallback((seat: ParsedSeat) => {
      if (isBeaconChecking) {
          Alert.alert("인증 진행 중", "도서관 위치를 확인하고 있습니다. 잠시만 기다려주세요.");
          return;
      }
      if (seat.isOccupied) {
          Alert.alert("사용 중", "이 좌석은 현재 사용 중입니다.");
          return;
      }
      setSelectedSeat(seat);
  }, [isBeaconChecking]);

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
                    // 홈 화면의 좌석 현황, 세션 정보 등을 최신 상태로 갱신
                    queryClient.invalidateQueries();
                    Alert.alert("예약 완료", "좌석이 성공적으로 예약되었습니다!", [
                      { text: "확인", onPress: () => {
                        // 네비게이션 스택을 완전히 비워 iOS 스와이프 백 방지
                        router.dismissAll();
                        router.replace('/(tabs)');
                      }}
                    ]);
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

  const { 
    onMapContainerLayout, 
    isReady, 
    seatSize, 
    mapWidth, 
    mapHeight, 
    scaledLeft, 
    scaledTop 
  } = useSeatMapLayout({ seats });

  const isLoadingUI = reserveMutation.isPending || isSeatsLoading;

  const getButtonText = () => {
    if (isBeaconRequired && autoBeacon.isLoading) {
      return '도서관 위치 확인 중...';
    }
    if (isBeaconRequired && isPreparingBeaconPermission) {
      return '권한 확인 중...';
    }
    if (isBeaconViewOnly) {
      return '비콘 인증 후 예약 가능';
    }
    if (!selectedSeat) {
      return '좌석을 선택해주세요';
    }
    return `${selectedSeat.number}번 좌석 예약하기`;
  };

  const isButtonDisabled = () => {
    if (isBeaconChecking || isBeaconViewOnly) return true;
    if (!selectedSeat) return true;
    if (reserveMutation.isPending) return true;
    return false;
  };

  return (
    <View style={styles.container}>
      {isLoadingUI ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={textColors.blue} />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.selectionContainer}>
              <View style={styles.selectionHeader}>
                  <Text preset="t4Bold" color={textColors.primary}>
                      {selectedSeat ? `${selectedSeat.number}번 좌석` : '좌석 선택'}
                  </Text>
                  {selectedSeat ? (
                      <Text preset="t6Bold" color={textColors.blue}>
                          시작 <Text preset="t6Medium" color={textColors.secondary}>{getSeatAssignmentTimeRange().start}</Text>  종료 <Text preset="t6Medium" color={textColors.secondary}>{getSeatAssignmentTimeRange().end}</Text>
                      </Text>
                  ) : (
                      <Text preset="t6Medium" color={textColors.tertiary}>
                          원하시는 좌석을 선택하세요
                      </Text>
                  )}
              </View>

              {isBeaconViewOnly && (
                <View style={styles.viewOnlyNotice}>
                  <Text preset="t7Bold" color={textColors.red} style={styles.viewOnlyNoticeTitle}>
                    조회 전용 모드
                  </Text>
                  <Text preset="t7Medium" color={textColors.secondary}>
                    비콘을 찾지 못해 좌석 현황만 표시합니다. 예약은 열람실 안에서 비콘 인증 후 가능합니다.
                  </Text>
                </View>
              )}
              
              <View 
                style={{ flex: 1 }} 
                onLayout={onMapContainerLayout}
              >
                  {isReady && (
                    <ScrollView 
                        horizontal
                        style={styles.mapContainer}
                        contentContainerStyle={{ minWidth: mapWidth }}
                    >
                  <ScrollView 
                      style={{ minWidth: mapWidth, minHeight: mapHeight }}
                      contentContainerStyle={{ width: mapWidth, height: mapHeight }}
                      centerContent={true}
                  >
                      {seats?.map(seat => (
                          <SeatItem
                              key={seat.id}
                              seat={seat}
                              isSelected={selectedSeat?.id === seat.id}
                              onPress={handleSeatPress}
                              scaledLeft={scaledLeft(seat.left)}
                              scaledTop={scaledTop(seat.top)}
                              seatSize={seatSize}
                          />
                      ))}
                  </ScrollView>
              </ScrollView>
                  )}
              </View>

              <View style={styles.footer}>
                  <Button 
                      variant={!isButtonDisabled() ? 'fill' : 'weak'}
                      color={!isButtonDisabled() ? 'primary' : 'dark'}
                      size="xlarge"
                      onPress={handleReservation} 
                      disabled={isButtonDisabled()}
                      loading={reserveMutation.isPending || isBeaconChecking}
                  >
                      {getButtonText()}
                  </Button>
              </View>
          </View>
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
  viewOnlyNotice: {
    marginHorizontal: 24,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffe1e4',
    backgroundColor: '#fff6f7',
  },
  viewOnlyNoticeTitle: {
    marginBottom: 2,
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
    borderColor: '#d1d5db', // 테두리를 약간 더 진하게 주어 누를 수 있는 '버튼' 느낌 강화
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  seatOccupied: {
    borderWidth: 0, // 테두리를 완전히 없애 입체감을 지움
    backgroundColor: '#e5e7eb', // 확연히 구분되는 배경색으로 눌려있는 듯한(Disabled) 느낌 부여
  },
  seatSelected: {
    borderWidth: 0,
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
