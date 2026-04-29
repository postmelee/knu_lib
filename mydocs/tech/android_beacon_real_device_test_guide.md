# Android 비콘 실기기 테스트 가이드

## 목적

Android native beacon 전환 후 실제 기기에서 비콘 인증이 동작하는지 검증한다. 이 테스트는 Issue #4, Stage 2의 기준 절차다.

## 전제 조건

- Android 실제 기기 1대 이상
- USB 케이블 또는 같은 Wi-Fi 네트워크
- Android 개발자 옵션과 USB 디버깅 활성화
- 기기 Bluetooth ON
- 기기 위치 서비스 ON
- 도서관 열람실 또는 KNU iBeacon 신호가 닿는 위치
- 강남대학교 도서관 로그인 가능한 계정
- Expo Go가 아니라 이 저장소의 dev build 또는 debug APK 사용

## 현재 준비된 APK

현재 브랜치에서 debug APK 빌드는 완료되어 있다.

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

APK는 Git 추적 대상이 아니며, 로컬 테스트용 산출물이다. 소스 변경 후 다시 빌드하려면 아래 명령을 사용한다.

```bash
cd android
./gradlew :app:assembleDebug
```

## 설치 및 실행

### 1. 기기 연결 확인

```bash
adb devices
```

기기가 `device` 상태로 보여야 한다. `unauthorized`면 기기 화면의 USB 디버깅 허용 팝업을 승인한다.

### 2. APK 설치

저장소 루트에서 실행한다.

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Metro 실행

Debug/dev build는 Metro 연결이 필요하다. USB 연결이면 포트를 reverse한다.

```bash
adb reverse tcp:8081 tcp:8081
npx expo start --dev-client
```

기기에서 설치된 앱을 열고 dev server에 연결한다.

대체 경로로, 빌드와 설치를 한 번에 수행하려면 다음 명령을 사용할 수 있다.

```bash
npx expo run:android --device
```

## 테스트 시나리오

### A. 권한 플로우

1. 앱을 새로 설치하거나 앱 권한을 초기화한다.
2. 로그인한다.
3. 비콘 인증이 필요한 열람실 예약 또는 연장 흐름으로 진입한다.
4. Android 권한 안내 Alert가 표시되는지 확인한다.
5. `권한 허용하기`를 누른다.
6. 시스템 권한 팝업에서 Nearby devices/Bluetooth, Location 권한을 허용한다.

기대 결과:

- 권한 거부 시 "블루투스 및 위치 권한이 필요합니다." 메시지가 표시된다.
- 권한 허용 시 native ranging이 시작된다.

### B. 기기 상태 플로우

1. Bluetooth OFF 상태에서 비콘 인증을 시도한다.
2. Location OFF 상태에서 비콘 인증을 시도한다.
3. 각 상태를 다시 ON으로 바꾼 뒤 재시도한다.

기대 결과:

- Bluetooth OFF: "블루투스를 켜주세요." 메시지
- Location OFF: "기기 위치 서비스가 꺼져 있습니다. 위치 서비스를 켠 뒤 다시 시도해주세요." 메시지
- 둘 다 ON이면 스캔 진행

### C. 실제 비콘 수신

1. 도서관 열람실 비콘 구역 안에서 비콘 인증을 시도한다.
2. 20초 안에 beacon result가 수신되는지 확인한다.
3. 서버 인증 API 결과가 성공이면 좌석 예약/연장 흐름으로 이어지는지 확인한다.

기대 결과:

- native module이 target UUID `24ddf411-8cf1-440c-87cd-e368daf9c93e`의 major/minor/rssi를 반환한다.
- `DoClickerBeaconAction` 성공 응답의 `l_communication_beacon_id`가 좌석 예약/연장 요청의 `Beacon` 파라미터로 전달된다.
- 비콘을 찾지 못하면 20초 후 "주변에서 도서관 비콘을 찾지 못했습니다." 메시지가 표시된다.

## 로그 수집

테스트 중 별도 터미널에서 아래 명령을 실행한다.

```bash
adb logcat | rg -i "BeaconRanging|BluetoothLeScanner|ReactNativeJS|ExpoModulesCore|SCAN_FAILED|PERMISSION_DENIED|LOCATION_DISABLED|BLUETOOTH_OFF|TIMEOUT|DoClickerBeaconAction"
```

`rg`가 없다면 다음을 사용한다.

```bash
adb logcat
```

실패 시 기록할 항목:

- Android 버전과 기기 모델
- 앱 권한 상태
- Bluetooth ON/OFF
- 위치 서비스 ON/OFF
- 도서관 비콘 구역 여부
- 표시된 사용자 메시지
- 로그의 error code 또는 timeout 여부

## 결과 기록 양식

| 항목 | 결과 |
|---|---|
| 테스트 일시 |  |
| 기기 모델 / Android 버전 |  |
| 앱 빌드 | `local/task4` debug APK |
| 위치 |  |
| Bluetooth 권한 | 허용 / 거부 |
| Location 권한 | 허용 / 거부 |
| 위치 서비스 | ON / OFF |
| Bluetooth | ON / OFF |
| 비콘 수신 | 성공 / 실패 / timeout |
| major/minor/rssi 확인 |  |
| 서버 인증 결과 | 성공 / 실패 |
| 좌석 예약/연장 연계 | 성공 / 실패 |
| 사용자 메시지 |  |
| 로그 요약 |  |

## 판정 기준

- 성공: 실제 도서관 비콘 구역에서 권한 허용 후 major/minor/rssi를 수신하고 서버 인증이 진행된다.
- 조건부 성공: native beacon 수신은 성공했지만 서버 인증이 실패한다. 이 경우 Seat API 파라미터 또는 계정/좌석 상태 문제로 분리한다.
- 실패: 권한/기기 상태가 정상인데도 native beacon result가 수신되지 않거나 앱이 crash한다.

## 후속 조치

- 성공이면 Stage 2 완료보고서에 기기/Android 버전/결과를 기록한다.
- 실패이면 `mydocs/troubleshootings/`에 재현 조건, 로그, 원인 후보를 기록하고 Stage 3에서 보정한다.
