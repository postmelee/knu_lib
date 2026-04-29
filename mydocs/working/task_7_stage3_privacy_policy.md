# Task #7 Stage 3 - 개인정보처리방침 iOS 출시 문구 보강

GitHub Issue: https://github.com/postmelee/knu_lib/issues/7

## 결과

iOS App Review와 App Privacy 문맥에 맞도록 `docs/privacy_policy.md`의 위치 권한 및 비콘 스캔 데이터 설명을 구체화했다.

## 변경

- 최근 개정일을 2026년 4월 30일로 추가
- 위치/BLE 항목을 `위치 권한 및 블루투스(BLE) 비콘 스캔 데이터`로 구체화
- GPS 좌표, 이동 경로, 지속적인 위치 정보를 수집/저장/전송하지 않는다는 문구 추가
- 비콘 Major/Minor/RSSI는 좌석 인증 목적으로 강남대학교 도서관 서버에만 전송된다고 명시
- iOS iBeacon 탐색 및 Android BLE 스캔 정책상 위치 권한이 필요할 수 있음을 명시

## 남은 작업

- 개인정보처리방침을 외부 공개 URL로 배포
- App Store Connect 개인정보 설문에서 최종 데이터 유형 선택
- 심사용 계정과 실제 iOS 스크린샷 준비

## 검증

문서 변경이므로 코드 실행 검증은 생략한다. `git diff --check`로 Markdown 공백 오류를 확인한다.
