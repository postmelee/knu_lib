# Task M030 #12 Stage 7 완료보고서 - Android 권한 세부 판별 보강

GitHub Issue: https://github.com/postmelee/knu_lib/issues/12

## 단계 목적

Android에서 비콘 인증 권한 실패가 발생했을 때 `위치 또는 블루투스 권한 문제`라는 포괄 안내만 표시하지 않고, 실제로 누락된 권한이 무엇인지 사용자에게 구체적으로 안내한다.

## 현재 상태 점검

에뮬레이터 `emulator-5554`의 `com.postmelee.KNU_library` 현재 권한 상태를 ADB로 확인했다.

| 권한 | 상태 |
|------|------|
| `android.permission.ACCESS_FINE_LOCATION` | `granted=false`, `USER_SET`, `USER_FIXED` |
| `android.permission.BLUETOOTH_SCAN` | `granted=false`, `USER_SET`, `USER_FIXED` |
| `android.permission.BLUETOOTH_CONNECT` | `granted=false`, `USER_SET`, `USER_FIXED` |
| AppOps `FINE_LOCATION` | `ignore` |
| AppOps `BLUETOOTH_SCAN` | `ignore` |
| AppOps `BLUETOOTH_CONNECT` | `ignore` |

즉 현재 에뮬레이터는 Android 12+ 기준 비콘 인증에 필요한 `위치 권한`과 `근처 기기 권한`이 모두 거절되어 있고, 설정 화면에서 직접 허용해야 하는 상태로 판단된다.

## 산출물

| 파일 | 변경 내용 |
|------|-----------|
| `src/services/beaconService.ts` | Android 권한 요청 결과를 권한별 라벨과 함께 반환하도록 보강 |
| `src/services/beaconService.ts` | 누락 권한 메시지에 `위치 권한`, `근처 기기 권한(비콘 스캔)`, `근처 기기 권한(블루투스 상태 확인)` 표시 |
| `src/screens/SeatReservationScreen.tsx` | 권한 준비 결과의 상세 메시지를 화면 안내에 사용 |
| `mydocs/report/task_m030_12_report.md` | 최종 결과보고서에 Android 권한 세부 판별 반영 |
| `mydocs/orders/20260430.md` | Task #12 완료 비고 갱신 |

## 본문 변경 정도 또는 본문 무손실 여부

권한이 모두 허용된 경우의 비콘 탐지 흐름은 유지했다. Android에서 `PermissionsAndroid.check`와 `requestMultiple` 결과를 권한별로 해석하는 계층만 추가했다.

권한이 거절되면 조회 전용 상태는 기존과 동일하게 유지한다. 다만 안내 메시지는 `비콘 인증에 필요한 권한이 허용되지 않았습니다: 위치 권한, 근처 기기 권한...`처럼 누락 권한을 구체적으로 표시한다. `never_ask_again` 결과가 포함되면 설정에서 직접 허용해야 한다는 문구를 사용한다.

## 검증 결과

| 검증 | 결과 | 비고 |
|------|------|------|
| `adb -s emulator-5554 shell dumpsys package com.postmelee.KNU_library` | 통과 | 위치/블루투스 권한 거절 상태 확인 |
| `adb -s emulator-5554 shell appops get com.postmelee.KNU_library` | 통과 | `FINE_LOCATION`, `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`가 `ignore`임을 확인 |
| `npx tsc --noEmit` | 통과 | TypeScript 오류 없음 |
| `rg -n "prepareBeaconScanPermissionResult|missingPermissions|근처 기기 권한|위치 권한|NEVER_ASK_AGAIN" src/services/beaconService.ts src/screens/SeatReservationScreen.tsx` | 통과 | 세부 권한 메시지 경로 확인 |
| `git diff --check` | 통과 | 공백 오류 없음 |

## 잔여 위험

- Android 권한 그룹 표시는 OS 버전에 따라 시스템 UI 문구가 다를 수 있다. 앱 안내는 기능 기준으로 `위치 권한`과 `근처 기기 권한`을 명시한다.
- 에뮬레이터는 실제 BLE 비콘 탐지 성공 검증에 한계가 있다. 실제 비콘 탐지 성공은 Android 실기기에서 확인해야 한다.

## 다음 단계 영향

권한 거절 상태를 사용자가 직접 해석할 수 있도록 안내 정확도를 높였다. 검증 완료 후 Stage 7 보정 커밋으로 기록한다.
