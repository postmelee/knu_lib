# Task M030 #4 Stage 1 완료보고서 - Android native beacon 전환

## 작업 개요

Issue #4 `Seat API 암호화/비콘/좌석 액션 회귀 검증`의 비콘 안정화 범위에서 Android 비콘 인증 방식을 iOS와 유사한 로컬 Expo native module 경로로 전환했다.

이 단계는 먼저 구현된 뒤 하이퍼-워터폴 문서화가 뒤따른 복구 단계다. 현재부터는 `local/task4` 브랜치, `mydocs/orders/20260429.md`, 본 Stage 보고서, 실기기 테스트 가이드를 기준으로 이어간다.

## 변경 요약

| 영역 | 내용 |
|---|---|
| JS 서비스 | `src/services/beaconService.ts`에서 iOS/Android 모두 `modules/beacon-ranging`의 `rangeKNUBeacon()`을 사용하도록 정리 |
| Android native | `modules/beacon-ranging/android/`에 Kotlin Expo module 추가 |
| 스캔 방식 | Android `BluetoothLeScanner.startScan()` 사용 |
| 파싱 방식 | Kotlin에서 iBeacon UUID, major, minor 추출 |
| 권한 | Android 12 이상 `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `ACCESS_FINE_LOCATION`; Android 11 이하 `ACCESS_FINE_LOCATION` |
| 의존성 | `react-native-ble-plx` dependency와 Expo plugin 제거 |
| 문서 | 비콘/프로젝트 상태 문서를 Android native 기준으로 갱신 |

## 검증 결과

| 검증 | 결과 |
|---|---|
| TypeScript | `npx tsc --noEmit` 통과 |
| Expo module autolinking | `npx expo-modules-autolinking resolve --platform android`에서 `beacon-ranging` 확인 |
| Android debug build | `./gradlew :app:assembleDebug` 통과 |
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` 생성 확인 |

## 남은 리스크

- Android 에뮬레이터는 실제 BLE iBeacon 수신 검증에 적합하지 않다.
- 실제 Android 기기에서 권한 팝업, 위치 서비스, Bluetooth ON 상태, 비콘 수신, 서버 인증 응답을 확인해야 한다.
- 도서관 비콘 구역 밖에서는 `TIMEOUT` 또는 서버 인증 실패가 정상적으로 발생할 수 있다.

## 다음 단계 승인 요청

Stage 2는 Android 실기기 테스트다. 테스트 담당자는 `mydocs/tech/android_beacon_real_device_test_guide.md`를 따라 설치, 실행, 로그 수집, 결과표 작성을 진행한다.
