# Seat API 암호화/비콘/좌석 액션 회귀 검증

## 목표

Seat Domain의 상태 조회, 좌석맵 파싱, 예약, 연장, 퇴실, 비콘 인증 흐름을 실제 서버 명세와 코드 기준으로 검증한다.

## 범위

- `src/api/seatApi.ts`의 암호화/파라미터 정책 재검토
- `src/services/seatService.ts` 상태 머신과 좌석 파싱 검토
- `src/hooks/queries/useSeat.ts` mutation 후 캐시 무효화 확인
- BLE 비콘 실제 기기 검증 절차와 fallback 정책 문서화

## 현재 세부 작업: Android native beacon 전환

이 작업은 #4의 비콘 안정화 범위에 포함한다. 이전 진행에서 하이퍼-워터폴 승인 게이트를 충분히 지키지 못했으므로, 현재 변경을 `local/task4` 브랜치와 아래 단계로 재정렬한다.

| 단계 | 상태 | 산출물 | 검증 |
|---|---|---|---|
| Stage 1 | 완료 | Android 비콘을 `modules/beacon-ranging` Expo native module로 전환, `react-native-ble-plx` 제거 | `npx tsc --noEmit`, Android autolinking, `./gradlew :app:assembleDebug` |
| Stage 2 | 대기 | Android 실기기 테스트 | `mydocs/tech/android_beacon_real_device_test_guide.md` 기준 권한/스캔/서버 인증 확인 |
| Stage 3 | 대기 | 실기기 테스트 결과 반영, 필요 시 보정, 최종 보고서 | 테스트 결과표, 잔여 리스크, PR 준비 |

## 검증

- `docs/mitlogs` 또는 실제 응답 기준으로 API 파라미터 정책이 설명되어야 한다.
- 예약/연장/퇴실 실패 메시지 처리 기준이 명확해야 한다.
- 실제 기기 검증이 불가능하면 불가능한 이유와 대체 검증을 기록한다.
- Android native beacon 전환은 실제 기기에서 권한 팝업, 위치 서비스, Bluetooth 상태, 타임아웃, 비콘 수신, 서버 인증 ID 전달까지 확인되어야 한다.

## 참고

- `docs/seat_reservation_spec.md`
- `docs/ai_seat_reservation_spec.md`
- `.agents/beacon_analysis.md`
- `mydocs/tech/android_beacon_real_device_test_guide.md`
- `mydocs/working/task_m030_4_stage1.md`
