# KNU Library App - 프로젝트 현황 보고서

> 작성일: 2026-04-29 | 기준: `devel` 계열 + Android native beacon 전환 작업

## 1. 프로젝트 개요

강남대학교 도서관 앱은 학생증 QR 출입, 열람실 좌석 예약/관리, 대출 현황 조회와 도서 연장을 단일 네이티브 앱에서 제공한다. 현재 앱은 React Native + Expo 기반이며, 실제 강남대 도서관/Clicker 계열 API를 직접 호출한다.

| 항목 | 내용 |
|---|---|
| 프레임워크 | React Native + Expo SDK 55 |
| 라우팅 | Expo Router |
| 상태관리 | `@tanstack/react-query` |
| HTTP 클라이언트 | Axios |
| 로컬 세션 | `expo-secure-store` |
| 네이티브 기능 | `modules/beacon-ranging` iOS/Android iBeacon 모듈 |
| 언어 | TypeScript |

## 2. 현재 도메인별 구현 상태

| 도메인 | Types | API | Service | Hooks | UI | 현재 상태 |
|---|---|---|---|---|---|---|
| Auth | 완료 | 완료 | 완료 | 완료 | 완료 | 구현됨 |
| User/QR | 완료 | 완료 | 완료 | 완료 | 완료 | 구현됨 |
| Seat | 완료 | 완료 | 완료 | 완료 | 완료 | 구현됨, 실제 서버 회귀 검증 필요 |
| Beacon | 완료 | 해당 없음 | 완료 | Seat Hook 통합 | 완료 | iOS/Android native 구현됨, 실제 기기 검증 필요 |
| Loan | 완료 | 완료 | 완료 | 완료 | 완료 | 목록/상세/연장 구현됨, 실제 서버 검증 필요 |

## 3. 주요 구현 내용

### Auth/User/QR

- 로그인은 `GetMyinformation?login=true`로 유효성을 검증한 뒤 SmartCard API를 호출한다.
- 세션은 `expo-secure-store`에 저장한다.
- `AuthGate`가 세션 존재 여부에 따라 로그인/홈 라우팅을 제어한다.
- `StudentCard`는 SmartCard 기반 이름, 학번, 소속, QR을 표시한다.
- QR 갱신은 `fetchQrId()`로 QR ID만 다시 가져와 React Query 캐시를 갱신한다.

### Seat/Beacon

- Seat 상태 조회, 열람실 목록, 좌석 HTML 파싱, 예약, 연장, 퇴실 흐름이 구현되어 있다.
- 비콘은 `modules/beacon-ranging` 로컬 Expo 네이티브 모듈을 사용한다.
- iOS는 CoreLocation 기반 ranging으로 iBeacon을 탐색한다.
- Android는 Kotlin Expo module에서 `BluetoothLeScanner`를 사용하고 iBeacon manufacturer data를 native로 파싱한다.
- 실제 도서관 비콘/서버 회귀 검증은 아직 별도 작업으로 남아 있다.

### Loan

- `src/services/loanService.ts`가 `/MyLibrary` HTML을 파싱해 대출 도서를 가져온다.
- `LoanSummaryCard`와 `app/loan-details.tsx`가 실제 대출 데이터를 사용한다.
- `extendRentalBook(bookId)`가 `/MyLibrary/Renewal/{bookId}`를 호출한다.
- `useRenewBookMutation()`과 `useExtendDialog()`가 연장 요청, 성공/실패 알림, Loan query invalidation을 담당한다.
- 실제 계정/서버에서 연장 성공·실패 메시지 검증은 남아 있다.

## 4. 검증 결과

| 검증 | 결과 |
|---|---|
| `npx tsc --noEmit` | 통과 |
| `npx expo-modules-autolinking resolve --platform android` | `beacon-ranging` Android module 확인 |
| `./gradlew :app:assembleDebug` | 통과 |
| `docs/` 원본 로그/APK/캡처 정리 | 완료, Markdown만 보존 |
| M050 배포 품질 관문 | `mydocs/tech/release_quality_gate_20260430.md`에 정리. Expo SDK patch mismatch는 릴리즈 전 차단 항목 |

## 5. 다음 작업

| 우선순위 | Issue | 작업 |
|---|---:|---|
| 높음 | #4 | Android 실제 기기 비콘 검증과 Seat API 실제 서버 회귀 검증 |
| 높음 | #5 | Loan 연장 성공/실패 메시지와 목록 갱신 실제 서버 검증 |
| 중간 | #3 | Auth/User/QR 회귀 검증과 QR 만료/갱신 정책 정리 |
