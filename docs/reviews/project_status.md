# KNU Library App - 프로젝트 현황 보고서

> 작성일: 2026-04-29 | 기준 브랜치: `refactor/ui-cleanup` | 상태: Hyper-Waterfall 전환 후 기준선 갱신

## 1. 프로젝트 개요

강남대학교 도서관 앱은 학생증 QR 출입, 열람실 좌석 예약/관리, 대출 현황 조회를 단일 네이티브 앱에서 제공한다. 현재 앱은 React Native + Expo 기반이며, 실제 강남대 도서관/Clicker 계열 API를 직접 호출한다.

| 항목 | 내용 |
|---|---|
| 프레임워크 | React Native + Expo SDK 55 |
| 라우팅 | Expo Router |
| 상태관리 | `@tanstack/react-query` |
| HTTP 클라이언트 | Axios |
| 로컬 세션 | `expo-secure-store` |
| 네이티브 기능 | iOS CoreLocation 비콘 모듈, Android BLE scan |
| 언어 | TypeScript |

## 2. 현재 도메인별 구현 상태

| 도메인 | Types | API | Service | Hooks | UI | 현재 상태 |
|---|---|---|---|---|---|---|
| Auth | 완료 | 완료 | 완료 | 완료 | 완료 | 구현됨 |
| User/QR | 완료 | 완료 | 완료 | 완료 | 완료 | 구현됨 |
| Seat | 완료 | 완료 | 완료 | 완료 | 완료 | 구현됨, 실제 회귀 검증 필요 |
| Beacon | 부분 | 해당 없음 | 완료 | Seat Hook 통합 | 완료 | 구현됨, 실제 기기 검증 필요 |
| Loan | 부분 | 목록 완료, 연장 브랜치 존재 | 목록 완료, 연장 브랜치 존재 | 목록 완료, 연장 브랜치 존재 | 상세 UI 완료 | 현재 브랜치 미반영분 있음 |

## 3. Loan Domain 정확한 상태

Loan 연장 API는 사용자의 기억처럼 **구현 완료 브랜치가 존재한다**. 다만 현재 작업 브랜치 `refactor/ui-cleanup`에는 아직 병합되어 있지 않다.

| 기준 | 상태 |
|---|---|
| 현재 브랜치 `refactor/ui-cleanup` | 대출 목록 파싱, 요약 카드, 상세 화면, 연장 버튼 UI까지 존재. 실제 연장 API 호출은 `/* extend API */` 주석으로 비어 있음. |
| 브랜치 `feat/loan-renewal` | 커밋 `21ea378 feat(loan): 도서 연장 기능 구현 및 Clean Architecture 리팩토링`에 실제 연장 구현 존재. |

`feat/loan-renewal`의 핵심 변경 파일:

```text
app/loan-details.tsx
src/api/types/book.ts
src/components/BookCard.tsx
src/hooks/queries/useLoan.ts
src/services/loanService.ts
```

따라서 최신 판단은 다음과 같다.

- Loan 목록/상세: 현재 브랜치에 반영됨
- Loan 연장 API: 구현 완료 브랜치 존재
- 현재 앱 반영: 미완료, 병합/이식 필요

## 4. 라우팅 구조

```text
app/
├── _layout.tsx              # AuthGate, QueryClientProvider, Stack
├── login.tsx                # 로그인 화면
├── loan-details.tsx         # 대출 상세 화면
└── (tabs)/
    ├── _layout.tsx          # 탭 네비게이션
    ├── index.tsx            # 홈 대시보드
    ├── rooms.tsx            # 열람실 목록 라우트
    └── seat-reservation.tsx # 좌석 선택/예약 라우트
```

## 5. 주요 구현 내용

### Auth/User/QR

- 로그인은 `GetMyinformation?login=true`로 유효성을 검증한 뒤 SmartCard API를 호출한다.
- 세션은 `expo-secure-store`에 저장한다.
- `AuthGate`가 세션 존재 여부에 따라 로그인/홈 라우팅을 제어한다.
- `StudentCard`는 SmartCard 기반 이름, 학번, 소속, QR을 표시한다.
- QR 갱신은 `fetchQrId()`로 QR ID만 다시 가져와 React Query 캐시를 갱신한다.

### Seat/Beacon

- Seat 상태 조회, 열람실 목록, 좌석 HTML 파싱, 예약, 연장, 퇴실 흐름이 구현되어 있다.
- iOS는 `modules/beacon-ranging`의 CoreLocation 기반 네이티브 모듈로 iBeacon ranging을 수행한다.
- Android는 `react-native-ble-plx`와 manufacturer data 파싱으로 iBeacon을 탐색한다.
- 실제 도서관 비콘/서버 회귀 검증은 아직 별도 작업으로 남아 있다.

### Loan

- `src/services/loanService.ts`가 `/MyLibrary` HTML을 파싱해 대출 도서를 가져온다.
- `LoanSummaryCard`와 `app/loan-details.tsx`가 실제 대출 데이터를 사용한다.
- 현재 브랜치의 연장 버튼은 실제 API를 호출하지 않는다.
- `feat/loan-renewal` 구현을 현재 브랜치로 병합/이식해야 한다.

## 6. 검증 결과

| 검증 | 결과 |
|---|---|
| `npx tsc --noEmit` | 통과 |
| 현재 브랜치에 `feat/loan-renewal` 포함 여부 | 미포함 |
| `docs/` 원본 로그/APK/캡처 정리 | 완료, Markdown만 보존 |

## 7. 다음 작업

| 우선순위 | Issue | 작업 |
|---|---:|---|
| 높음 | #5 | `feat/loan-renewal`의 Loan 연장 구현을 현재 브랜치에 병합/이식 |
| 높음 | #4 | Seat API 암호화/파라미터 정책과 실제 기기 비콘 검증 |
| 중간 | #3 | Auth/User/QR 회귀 검증과 QR 만료/갱신 정책 정리 |
| 중간 | #2 | Expo dev client 빌드/권한/배포 품질 관문 정리 |
