# Task #7 - iOS 출시 준비 수행 계획

GitHub Issue: https://github.com/postmelee/knu_lib/issues/7

## 배경

KNU Library 앱을 iOS TestFlight 및 App Store 심사에 올릴 수 있는 상태로 정리한다. 현재 앱은 Expo SDK 55, EAS 설정, iOS 번들 식별자, 위치/블루투스 권한 설명, iOS CoreLocation 비콘 ranging 모듈을 보유하고 있다.

다만 실제 제출에는 Apple Developer 계정, App Store Connect 앱 레코드, `ascAppId`, 인증서/프로비저닝, 스크린샷, 개인정보 설문, 비공식 앱 고지 등 계정과 운영 준비가 필요하다.

## 목표

- EAS Build/Submit 기반 iOS 출시 경로를 확정한다.
- 현재 `app.json`, `eas.json`, 개인정보처리방침의 출시 준비 상태를 점검한다.
- App Store Connect 제출 전 누락값과 계정 의존 작업을 분리한다.
- 실기기 회귀 검증 체크리스트를 문서화한다.

## 범위

- `app.json` iOS 설정 점검
- `eas.json` production/submit 설정 점검
- `docs/privacy_policy.md` 기준 개인정보/권한 설명 점검
- `mydocs/tech/ios_release_checklist_20260430.md` 작성
- 로컬 정적 검증 실행 및 결과 기록

## 제외

- Apple Developer 계정 로그인
- App Store Connect 앱 레코드 생성
- 실제 인증서/프로비저닝 생성
- 실제 TestFlight 업로드
- 도서관 현장 iOS 비콘 회귀 테스트

위 항목은 계정 권한, 실기기, 현장 접근 또는 배포자 판단이 필요하므로 후속 수동 단계로 남긴다.

## 구현 단계

1. 기준선 확인
   - 현재 Expo/EAS 설정과 개인정보처리방침을 확인한다.
   - 제출 전 누락값과 위험 항목을 분리한다.

2. 출시 체크리스트 작성
   - App Store Connect 준비물, EAS 명령, 수동 검증 시나리오를 문서화한다.
   - 비공식 앱, 인증정보, 위치/블루투스 권한 관련 App Review 리스크를 기록한다.

3. 로컬 검증
   - `npx expo config --type public`으로 Expo 설정 해석을 확인한다.
   - `npx tsc --noEmit`으로 타입 검사를 수행한다.
   - 실행하지 못한 검증은 사유와 남은 리스크를 남긴다.

## 완료 기준

- GitHub Issue #7이 iOS 출시 준비 작업 단위로 존재한다.
- `mydocs/`에 수행 계획, 체크리스트, 단계 기록이 남는다.
- 로컬에서 가능한 정적 검증 결과가 기록된다.
- 실제 제출 전 필요한 외부 작업이 명확히 분리된다.
