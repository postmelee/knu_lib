# Task M030 #12 Stage 6 완료보고서 - iOS/Android 권한 거절 안내 점검

GitHub Issue: https://github.com/postmelee/knu_lib/issues/12

## 단계 목적

좌석 예약 화면 첫 진입 후 iOS/Android에서 위치 및 블루투스 권한을 정상 수락하면 비콘 탐지로 이어지고, 권한 거절 시 비콘 인증 실패 원인이 권한 문제임을 명확히 안내하며 앱 설정 이동 안내를 제공하는지 점검한다.

## 점검 결과

| 플랫폼 | 확인 결과 | 조치 |
|--------|-----------|------|
| iOS | 기존 네이티브 모듈은 `requestWhenInUseAuthorization()` 호출 직후 ranging을 시작해 권한 거절을 권한 오류로 분리하지 못할 수 있음 | 위치 권한 승인 후 ranging 시작, 거절/제한 시 권한 오류 반환으로 변경 |
| Android | `PermissionsAndroid.requestMultiple`로 위치/블루투스 권한 요청은 수행하지만 거절 후 설정 이동 안내가 부족함 | 권한 거절 시 앱 설정 이동 버튼이 있는 안내 팝업 표시 |
| 공통 UI | 권한 거절 상태가 일반 비콘 미탐지와 같은 흐름으로 보일 수 있음 | 권한 문제는 `권한 허용 후 예약 가능` 버튼 문구와 설정 이동 안내로 분리 |

## 산출물

| 파일 | 변경 내용 |
|------|-----------|
| `src/screens/SeatReservationScreen.tsx` | 권한 거절 상태, 설정 열기 팝업, 예약 시도 시 권한 안내 추가 |
| `modules/beacon-ranging/ios/BeaconRangingModule.swift` | iOS 위치 권한 승인 후 ranging 시작, 거절 시 권한 오류 반환 |
| `mydocs/report/task_m030_12_report.md` | 최종 결과보고서에 권한 점검과 보정 반영 |
| `mydocs/orders/20260430.md` | Task #12 완료 비고 갱신 |

## 본문 변경 정도 또는 본문 무손실 여부

비콘 탐지 성공 경로는 유지했다. 권한이 이미 허용되어 있거나 첫 요청에서 허용되면 기존과 동일하게 `rangeKNUBeacon`이 비콘 ranging을 수행한다.

권한 거절 경로는 조회 전용 상태로 남긴다. 좌석 조회는 유지하고 예약 버튼은 `권한 허용 후 예약 가능`으로 표시한다. 사용자가 예약을 시도하면 권한 문제 안내와 `설정 열기` 버튼을 다시 제공한다.

## 검증 결과

| 검증 | 결과 | 비고 |
|------|------|------|
| `npx tsc --noEmit` | 통과 | TypeScript 오류 없음 |
| `rg -n "설정 열기|권한 허용 후 예약 가능|LOCATION_PERMISSION_DENIED|requestWhenInUseAuthorization" src modules` | 통과 | 권한 안내와 iOS 권한 분기 확인 |
| `git diff --check` | 통과 | 공백 오류 없음 |
| `RCT_USE_PREBUILT_RNCORE=0 npx expo run:ios --device 00008110-000174CA260A801E --configuration Debug` | 통과 | iOS Debug 빌드 및 설치 성공. 최초 1회 Swift 헬퍼 누락으로 실패 후 보정 재실행 |

## 잔여 위험

- iOS Debug 빌드는 통과했지만, 최초 권한 허용/거절의 실제 UI 선택은 작업지시자 실기기에서 한 번 더 확인해야 한다.
- Android 실기기 권한 팝업은 OS 버전과 이전 거절 상태에 따라 다시 뜨지 않을 수 있다. 이 경우 앱 설정 이동 안내로 권한 수락을 유도한다.

## 다음 단계 영향

권한 허용/거절 UX 점검에서 확인된 부족분을 반영했다. 검증 완료 후 Stage 6 보정 커밋으로 기록한다.
