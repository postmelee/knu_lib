import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { textColors } from '@/styles/typography';
import { MaterialIcons } from '@expo/vector-icons';
import { useSeatState, useExtendSeat, useReleaseSeat } from '../hooks/queries/useSeat';
import { UserState } from '../api/types/seat';

/**
 * Parses a datetime string in "yyyyMMddHHmmss" format (e.g., "20260316142740")
 * into a JS Date object. Returns null if parsing fails.
 */
function parseTimeString(timeStr?: string): Date | null {
  if (!timeStr || timeStr.length < 14) return null;
  const y = parseInt(timeStr.substring(0, 4), 10);
  const mo = parseInt(timeStr.substring(4, 6), 10) - 1; // month is 0-indexed
  const d = parseInt(timeStr.substring(6, 8), 10);
  const h = parseInt(timeStr.substring(8, 10), 10);
  const mi = parseInt(timeStr.substring(10, 12), 10);
  const s = parseInt(timeStr.substring(12, 14), 10);
  const date = new Date(y, mo, d, h, mi, s);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a Date to "HH:MM" string
 */
function formatHHMM(date: Date | null): string {
  if (!date) return '--:--';
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Returns remaining time as "H시간 MM분" or "MM분"
 */
function formatRemaining(ms: number): string {
  if (ms <= 0) return '종료됨';
  const totalMin = Math.ceil(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}시간 ${String(m).padStart(2, '0')}분`;
  return `${m}분`;
}

export function SeatStatusCard() {
  const router = useRouter();
  
  const { data: seatData, isLoading } = useSeatState();
  const extendMutation = useExtendSeat();
  const releaseMutation = useReleaseSeat();

  // Tick every 30s to keep remaining time / progress bar fresh
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const handleReturn = () => {
    Alert.alert("퇴실 확인", "정말 퇴실하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "퇴실", style: "destructive", onPress: () => {
          releaseMutation.mutate(undefined, {
            onSuccess: () => Alert.alert("완료", "퇴실이 완료되었습니다."),
            onError: (err: any) => Alert.alert("오류", err.message)
          });
      }}
    ]);
  };

  const handleExtend = () => {
    extendMutation.mutate(undefined, {
        onSuccess: () => Alert.alert("연장 완료", "좌석 연장이 완료되었습니다."),
        onError: (err: any) => Alert.alert("요청 실패", err.message)
    });
  };

  const handleReserve = () => {
    router.push('/(tabs)/rooms');
  };

  const hasActiveSeat = seatData?.currentState === UserState.SEATED || seatData?.currentState === UserState.AWAY;

  // --- Time calculations ---
  const startDate = parseTimeString(seatData?.raw?.l_clicker_user_status_seat_time_start);
  const endDate = parseTimeString(seatData?.raw?.l_clicker_user_status_seat_time_stop);

  let progressPercent = 0;
  let remainingText = '--:--';

  if (startDate && endDate) {
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();

    if (totalDuration > 0) {
      // Progress is how much time has PASSED (fills left to right)
      progressPercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    }

    const remainingMs = endDate.getTime() - now.getTime();
    remainingText = formatRemaining(remainingMs);
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', height: 200 }]}>
        <ActivityIndicator size="large" color={textColors.blue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text preset="t5Bold" color={textColors.primary}>이용 중인 좌석</Text>

      {hasActiveSeat ? (
        <>
          <View style={styles.cardBox}>
            <View style={styles.cardHeader}>
              <View>
                <Text preset="t7Bold" color={textColors.secondary} style={styles.roomNameSpacing}>
                  {seatData?.raw?.l_clicker_user_status_seat_room_name || '도서관 열람실'}
                </Text>
                <Text style={{marginLeft: -5}} preset="t3Bold" color={textColors.primary}>
                  {seatData?.raw?.l_clicker_user_status_seat_number || ''}번 좌석
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.timeHeader}>
                <Text preset="t7Medium" color={textColors.secondary}>남은 시간</Text>
                <Text preset="t7Bold" color={textColors.blue}>
                   {remainingText}
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <View style={styles.timeFooter}>
                <Text preset="t7Medium" color={textColors.secondary}>시작 {formatHHMM(startDate)}</Text>
                <Text preset="t7Medium" color={textColors.secondary}>종료 {formatHHMM(endDate)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Button variant="weak" color="danger" size="large" onPress={handleReturn} style={styles.flexButton} disabled={releaseMutation.isPending}>
              {releaseMutation.isPending ? '처리중' : '퇴실하기'}
            </Button>
            <Button variant="weak" color="primary" size="large" onPress={handleExtend} style={styles.flexButton} disabled={extendMutation.isPending}>
              {extendMutation.isPending ? '처리중' : '연장하기'}
            </Button>
          </View>
        </>
      ) : (
        <>
          {/* Empty State */}
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="event-seat" size={26} color={textColors.tertiary} />
            </View>
            <View style={styles.emptyTextGroup}>
              <Text preset="t6Bold" color={textColors.secondary}>현재 이용 중인 좌석이 없습니다.</Text>
              <Text preset="t7Medium" color={textColors.tertiary}>도서관 좌석을 예약하고 열람실을 이용해보세요.</Text>
            </View>
          </View>

          <View style={styles.reserveButtonContainer}>
            <Button variant="weak" color="primary" size="large" onPress={handleReserve} style={styles.fullWidth}>좌석 예약하기</Button>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  roomNameSpacing: {
    marginBottom: 4,
  },

  // ── Active Seat ──
  cardBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    gap: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    backgroundColor: '#e8f3ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  progressContainer: {
    gap: 8,
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: textColors.blue,
    borderRadius: 999,
  },
  timeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  flexButton: {
    flex: 1,
  },

  // ── Empty State ──
  emptyBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 175,
    gap: 12,
    marginTop: 12,
  },
  emptyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 4,
  },
  emptyTextGroup: {
    alignItems: 'center',
    gap: 4,
  },
  reserveButtonContainer: {
    marginTop: 12,
  },
  fullWidth: {
    width: '100%',
  },
});
