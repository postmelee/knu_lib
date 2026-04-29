# Android 비콘 권한 승인 직후 loading 지속 이슈

## 현상

Android 실기기 테스트 중 Bluetooth 및 위치 권한을 최초 승인한 직후, 좌석 예약 화면의 버튼 loading이 계속 유지되는 현상이 보고되었다. 같은 화면을 나갔다가 다시 좌석 예약 화면으로 들어오면 정상 진행된다.

## 원인 후보

- 좌석 예약 화면 진입 즉시 `useAutoBeaconAuth()` query가 시작되고, 같은 query 안에서 Android runtime permission 요청과 native beacon scan이 연속으로 실행된다.
- Android 권한 팝업은 앱 focus/activity 상태를 일시적으로 바꿀 수 있어, 첫 승인 직후 진행 중 query가 화면 상태와 어긋날 가능성이 있다.
- native scan timeout이 호출되지 않는 예외 상황에서는 버튼 loading이 무기한 유지될 수 있다.

## 조치

- 좌석 예약 화면에서 권한 확인과 비콘 인증 query 시작을 분리했다.
- Android 권한이 승인된 뒤 `isBeaconPermissionReady`를 true로 바꾸고, 다음 렌더 사이클에서 `useAutoBeaconAuth()`를 활성화한다.
- 비콘 인증 query에 35초 JS 안전 타임아웃을 추가해 native timeout이 누락되어도 화면이 실패 상태로 전환되게 했다.

## 검증

- `npx tsc --noEmit` 통과

## 실기기 재검증 포인트

1. 앱 삭제 또는 앱 권한 초기화 후 재설치
2. 좌석 예약 화면 첫 진입
3. Bluetooth/위치 권한 최초 승인
4. 같은 화면에서 자동으로 `도서관 위치 확인 중...` 단계로 넘어가는지 확인
5. 비콘 수신 성공 또는 35초 내 실패 메시지 표시 여부 확인
