# Task #7 - iOS 출시 준비 결과 보고

GitHub Issue: https://github.com/postmelee/knu_lib/issues/7

## 결론

iOS TestFlight/App Store 제출을 위한 로컬 준비 문서를 정리했다. 현재 코드 기준으로 EAS Build/Submit 경로를 사용할 수 있으며, App Store Connect 계정에서만 확정 가능한 값과 실제 현장 검증 항목을 별도로 분리했다.

이번 작업에서는 실제 App Store Connect 앱 생성, 인증서/프로비저닝 설정, TestFlight 업로드는 수행하지 않았다. 해당 작업은 Apple Developer 계정 권한과 심사용 계정, 현장 iOS 기기가 필요하다.

## 변경 파일

| 파일 | 내용 |
|---|---|
| `mydocs/plans/task_7_ios_release_preparation.md` | iOS 출시 준비 수행 계획 |
| `mydocs/tech/ios_release_checklist_20260430.md` | EAS/ASC 제출 전 체크리스트 |
| `mydocs/tech/ios_app_store_metadata_20260430.md` | 제품 페이지 문안, 심사 노트, 개인정보 설문 초안 |
| `mydocs/working/task_7_stage1_ios_release_baseline.md` | Stage 1 기준선 보고 |
| `mydocs/working/task_7_stage2_ios_store_metadata.md` | Stage 2 제출 문안 보고 |
| `mydocs/working/task_7_stage3_privacy_policy.md` | Stage 3 개인정보처리방침 보강 보고 |
| `docs/privacy_policy.md` | 위치 권한 및 비콘 스캔 데이터 처리 문구 보강 |
| `mydocs/orders/20260430.md` | #7 작업 진행 상태 반영 |

## 검증

| 명령 | 결과 | 비고 |
|---|---|---|
| `npx expo config --type public` | 통과 | Stage 1에서 공개 Expo 설정 해석 확인 |
| `npx tsc --noEmit` | 통과 | Stage 1에서 타입 오류 없음 확인 |
| `git diff --check` | 통과 | Stage 3 최종 변경 후 Markdown 공백 오류 없음 확인 |

## 남은 외부 작업

| 작업 | 상태 | 비고 |
|---|---|---|
| Apple Developer Program 확인 | 미완료 | 배포자 계정 필요 |
| App Store Connect 앱 레코드 생성 | 미완료 | 앱 이름, bundle id, SKU 확정 필요 |
| `ascAppId` 확보 및 `eas.json` 반영 | 미완료 | 앱 레코드 생성 후 가능 |
| EAS iOS credentials/API Key 설정 | 미완료 | `eas credentials --platform ios` |
| 개인정보처리방침 공개 URL 준비 | 미완료 | App Store Connect 입력 필수 |
| 지원 URL 준비 | 미완료 | 제품 페이지 및 심사용 연락 경로 |
| 심사용 계정 준비 | 미완료 | 실제 도서관 서버 로그인 가능 계정 필요 |
| iOS 스크린샷 촬영 | 미완료 | 개인정보/QR 값 마스킹 필요 |
| iOS 실기기 회귀 검증 | 미완료 | TestFlight 또는 production build 설치 후 검증 |
| 암호화/수출 규정 최종 판단 | 미완료 | Sponge 암호화 때문에 보수적 확인 필요 |

## 다음 단계

1. App Store Connect에서 앱 레코드를 생성하고 `ascAppId`를 확보한다.
2. `eas.json`의 `submit.production.ios.ascAppId`에 실제 값을 반영한다.
3. 개인정보처리방침과 지원 페이지를 공개 URL로 배포한다.
4. 심사용 계정과 스크린샷을 준비한다.
5. `eas build --platform ios --profile production` 후 TestFlight 회귀 검증을 수행한다.
