# Task #7 Stage 1 - iOS 출시 준비 기준선

GitHub Issue: https://github.com/postmelee/knu_lib/issues/7

## 결과

iOS 출시 준비 작업을 GitHub Issue #7로 등록하고, 현재 Expo/EAS 설정 기준의 출시 준비 항목을 분리했다.

## 확인한 기준선

| 파일 | 확인 내용 |
|---|---|
| `app.json` | iOS bundleIdentifier, 권한 설명, EAS projectId, updates/runtimeVersion 존재 |
| `eas.json` | production build profile, `autoIncrement`, production submit profile 존재 |
| `docs/privacy_policy.md` | 비공식 앱 고지, SecureStore 기반 인증정보 저장, 위치/BLE 권한 목적 설명 존재 |
| `modules/beacon-ranging/ios/BeaconRangingModule.swift` | iOS CoreLocation iBeacon ranging 구현 존재 |

## 변경

- `mydocs/plans/task_7_ios_release_preparation.md` 작성
- `mydocs/tech/ios_release_checklist_20260430.md` 작성
- `mydocs/working/task_7_stage1_ios_release_baseline.md` 작성
- `mydocs/orders/20260430.md`에 #7 작업 추가

## 남은 작업

- App Store Connect 앱 레코드 생성 후 `ascAppId` 확보
- EAS iOS credentials/API Key 설정
- 개인정보처리방침 공개 URL 준비
- App Review Notes와 스크린샷 준비
- iOS 실기기/TestFlight 회귀 검증

## 검증

| 명령 | 결과 | 비고 |
|---|---|---|
| `npx expo config --type public` | 통과 | `.env` 로드 후 공개 Expo 설정 해석 확인 |
| `npx tsc --noEmit` | 통과 | 타입 오류 없음 |

## 설정 변경 판단

이번 단계에서는 `app.json` 또는 `eas.json`을 변경하지 않았다. `submit.production.ios.ascAppId`는 App Store Connect 앱 레코드를 만든 뒤 확인되는 값이므로 placeholder를 넣지 않는다.

`ios.bundleIdentifier`는 현재 Apple 허용 문자 범위에는 맞지만 첫 업로드 후 변경할 수 없으므로, 실제 App Store Connect 앱 생성 전에 최종 확정해야 한다.
