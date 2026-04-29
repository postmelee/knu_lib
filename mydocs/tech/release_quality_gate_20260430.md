# 배포 품질 관문 - 2026-04-30

## 목적

Issue #2의 기준 문서다. Expo dev client, iOS/Android 권한, 개인정보/로그 정책, 배포 전 검증 명령을 한 곳에 정리한다.

## 현재 앱 기준

| 항목 | 기준 |
|---|---|
| Expo SDK | 55 |
| React Native | 0.83 계열 |
| Dev client | `expo-dev-client` 사용 |
| 앱 스킴 | `knu-library` |
| iOS bundle identifier | `com.postmelee.KNU-library` |
| Android package | `com.postmelee.KNU_library` |
| Updates runtime | `runtimeVersion.policy = appVersion` |
| 서버 | `https://lib.kangnam.ac.kr` |
| 세션 저장소 | `expo-secure-store` |

## 권한 매트릭스

| 플랫폼 | 설정 | 목적 | 확인 위치 |
|---|---|---|---|
| iOS | `NSBluetoothAlwaysUsageDescription` | 도서관 비콘 인증 | `app.json` |
| iOS | `NSLocationWhenInUseUsageDescription` | CoreLocation 기반 iBeacon ranging | `app.json` |
| Android | `BLUETOOTH_SCAN` | Android 12+ BLE scan | `app.json` |
| Android | `BLUETOOTH_CONNECT` | Android 12+ Bluetooth 상태 접근 | `app.json` |
| Android | `ACCESS_FINE_LOCATION` | BLE scan 및 위치 서비스 요구 | `app.json` |
| Android | `BLUETOOTH`, `BLUETOOTH_ADMIN` | Android 11 이하 호환 | `app.json` |

## 개인정보/로그 정책

- 인증 정보는 `expo-secure-store`에만 저장한다.
- 신규 문서나 코드에서 `AsyncStorage`를 인증 저장소로 쓰지 않는다.
- 비콘 스캔 결과의 Major, Minor, RSSI는 서버 인증 요청에만 쓰고 별도 원격 서버나 문서에 원문 로그로 보존하지 않는다.
- 원본 MITM 로그, APK, 캡처, 참조 Python은 Git 추적 대상이 아니다.
- 릴리즈 전 `docs/privacy_policy.md`가 현재 권한과 세션 저장 정책을 설명하는지 확인한다.

## Dev Client 절차

### 공통 준비

```sh
npm ci
npx expo install --check
npx tsc --noEmit
npx expo config --type public
npx expo-modules-autolinking resolve --platform ios
npx expo-modules-autolinking resolve --platform android
```

### iOS 로컬 실행

```sh
npm run ios
```

확인 항목:

| 항목 | 기대값 |
|---|---|
| 앱 실행 | 로그인 화면 또는 저장 세션 기준 홈 진입 |
| 권한 문구 | Bluetooth/Location 사용 목적이 한국어로 표시 |
| 비콘 | 실제 기기에서만 CoreLocation ranging 검증 |
| QR/대출/좌석 | 최소 홈 진입과 각 카드 렌더링 확인 |

### Android 로컬 실행

```sh
npm run android
```

확인 항목:

| 항목 | 기대값 |
|---|---|
| 권한 안내 Alert | 앱 내부 권한 안내 후 시스템 권한 요청 |
| Nearby devices/Bluetooth | Android 12+에서 허용 가능 |
| Location | 권한 허용 및 위치 서비스 ON 필요 |
| 비콘 | 실제 도서관 비콘 구역에서 native ranging 결과 수신 |
| 실패 메시지 | 권한 거부, Bluetooth OFF, Location OFF, timeout 메시지 표시 |

## 배포 전 체크리스트

| 관문 | 명령/자료 | 통과 기준 |
|---|---|---|
| 의존성 설치 | `npm ci` | lockfile 기준 설치 성공 |
| Expo 권장 버전 | `npx expo install --check` | mismatch 없음 |
| 타입 검사 | `npx tsc --noEmit` | 에러 없음 |
| Expo config | `npx expo config --type public` | 권한, bundle id, package, updates 확인 |
| Expo doctor | `npx expo-doctor` | 실패 없음. 네트워크 실패는 사유 기록 |
| Native module iOS | `npx expo-modules-autolinking resolve --platform ios` | `beacon-ranging` 확인 |
| Native module Android | `npx expo-modules-autolinking resolve --platform android` | `beacon-ranging` 확인 |
| 개인정보 | `docs/privacy_policy.md` | SecureStore, 권한, 로그 미보관 설명 |
| 민감자료 | `rg -n "AsyncStorage|10초|Plain Text|MITM|APK|capture|미추적|react-native-ble-plx|raw BLE" AGENTS.md .agents docs mydocs` | 오래된 기준 또는 추적 금지 산출물 오해 없음 |
| 수동 실행 | `npm run ios`, `npm run android` | 변경 영향 플랫폼에서 실행 결과 기록 |

## 2026-04-30 검증 결과

| 검증 | 결과 | 비고 |
|---|---|---|
| `npm ci --cache /private/tmp/knu_npm_cache --loglevel=warn` | 통과 | 최초 sandbox 실행은 registry DNS 차단으로 실패, 네트워크 허용 후 통과 |
| `npx tsc --noEmit` | 통과 | TypeScript 에러 없음 |
| `npx expo config --type public` | 통과 | `ios.icon`을 Expo schema에 맞게 문자열로 보정 |
| `npx expo-modules-autolinking resolve --platform ios` | 통과 | `beacon-ranging` pod 확인 |
| `npx expo-modules-autolinking resolve --platform android` | 통과 | `beacon-ranging` Android module 확인 |
| `npx expo install --check` | 실패 | Expo SDK 55 권장 patch 버전과 현재 package mismatch |
| `npx expo-doctor` | 부분 실패 | schema 오류는 보정했으나 Expo API/RN Directory 네트워크 조회가 실패할 수 있음 |
| `npm run ios`, `npm run android` | 미실행 | clean worktree에는 `ios/`, `android/`가 없고 실행 시 prebuild와 기기/시뮬레이터가 필요함 |

## 릴리즈 전 차단 항목

| 항목 | 상태 | 처리 기준 |
|---|---|---|
| Expo SDK 55 patch mismatch | 차단 | `npx expo install --check`가 요구하는 Expo/RN patch 버전으로 업데이트 후 재검증 |
| npm audit | 주의 | `npm ci` 결과 19개 취약점 보고. 릴리즈 전 `npm audit` 세부 검토 |
| iOS/Android 실제 실행 | 차단 | `npm run ios`, `npm run android` 또는 EAS development build 결과 기록 |
| Expo API/RN Directory 조회 | 주의 | 네트워크 가능한 환경에서 `npx expo-doctor` 재실행 |
