# Task #7 Stage 2 - iOS App Store 제출 문안 정리

GitHub Issue: https://github.com/postmelee/knu_lib/issues/7

## 결과

App Store Connect 앱 레코드 생성 후 참고할 수 있는 iOS 제품 페이지 문안, App Review Notes, 개인정보 설문 초안, 스크린샷 계획을 작성했다.

## 변경

- `mydocs/tech/ios_app_store_metadata_20260430.md` 작성
- `mydocs/tech/ios_release_checklist_20260430.md`에 Stage 2 산출물과 제출 문안 준비 상태 반영

## 주요 결정

| 항목 | 결정 |
|---|---|
| 앱 소개 문안 | 비공식 서드파티 앱 고지를 제품 설명과 심사 노트에 명시 |
| 심사 노트 | 별도 백엔드 없음, SecureStore 저장, 도서관 서버 직접 통신, 비콘 권한 목적을 설명 |
| 개인정보 설문 | User ID, 비밀번호, 비콘/위치 권한, 대출 정보는 보수적 초안으로 분리 |
| 암호화 문항 | Sponge 암호화가 있으므로 `ITSAppUsesNonExemptEncryption=false` 자동 설정은 보류 |
| 스크린샷 | 로그인, 학생증 QR, 열람실, 좌석맵, 이용 중 좌석, 대출, 설정 화면 기준으로 계획 |

## 남은 작업

- 개인정보처리방침 공개 URL 확정
- 지원 URL 확정
- App Store Connect 앱 레코드 생성과 `ascAppId` 확보
- 심사용 계정 준비
- 실제 iOS 스크린샷 촬영
- 암호화/수출 규정 문항 최종 판단

## 검증

문서 변경이므로 코드 실행 검증은 생략했다.

| 명령 | 결과 | 비고 |
|---|---|---|
| `git diff --check` | 통과 | Markdown 공백 오류 없음 |
