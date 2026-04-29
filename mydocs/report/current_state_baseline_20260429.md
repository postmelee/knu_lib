# KNU Library 현재 상태 기준선 - 2026-04-29

## 요약

KNU Library 앱은 Hyper-Waterfall 적용에 적합하다. API 역공학과 모바일 네이티브 기능이 섞여 있어, 구현 전에 계획과 검증 기준을 문서화하는 방식이 실질적인 리스크를 줄인다.

현재 저장소에는 `docs/`에 PRD, 좌석 예약 명세, MITM 로그, 코드 리뷰 보고서가 남아 있다. 다만 `mydocs/` 운영 구조는 없었고, `docs/`도 Git 기준 미추적 상태다. 이번 기준선 작업은 기존 자료를 이동하지 않고 `mydocs/` 프로세스 기록을 새로 시작한다.

## 저장소 상태

| 항목 | 현재 |
|---|---|
| 현재 브랜치 | `refactor/ui-cleanup` |
| 원격 저장소 | `https://github.com/postmelee/knu_lib.git` |
| 앱 스택 | React Native + Expo SDK 55, Expo Router, React Query, Axios, TypeScript |
| 로컬 문서 | `docs/` 존재, `mydocs/` 신규 도입 |
| 미추적 항목 | `docs/`, `Icon Exports/`, `mydocs/` |

## 구현 상태

| 도메인 | 현재 코드 기준 상태 | 주요 파일 |
|---|---|---|
| Auth | 구현됨. `SecureStore` 기반 세션 저장과 AuthGate 라우팅이 존재한다. | `src/services/authService.ts`, `src/hooks/queries/useAuth.ts`, `app/_layout.tsx`, `app/login.tsx` |
| User/QR | 구현됨. SmartCard 기반 사용자 표시와 QR 카드가 존재한다. | `src/services/userService.ts`, `src/hooks/queries/useUser.ts`, `src/components/StudentCard.tsx` |
| Seat | 구현됨. 상태 조회, 열람실 목록, 좌석맵 파싱, 예약/연장/퇴실 훅이 존재한다. | `src/api/seatApi.ts`, `src/services/seatService.ts`, `src/hooks/queries/useSeat.ts`, `src/components/SeatStatusCard.tsx` |
| Beacon | 구현됨. 네이티브 모듈과 서비스 레이어가 존재하지만 실제 기기 검증 기록은 별도 필요하다. | `modules/beacon-ranging/`, `src/services/beaconService.ts` |
| Loan | 부분 구현됨. 대출 목록 파싱, 요약 카드, 상세 화면은 있으나 연장 API 실제 구현은 확인 필요하다. | `src/services/loanService.ts`, `src/hooks/queries/useLoan.ts`, `src/components/LoanSummaryCard.tsx`, `app/loan-details.tsx` |

## 기존 문서와 코드의 차이

| 문서 | 차이 |
|---|---|
| `docs/reviews/project_status.md` | Loan Domain을 미완성으로 기록하지만 현재 코드에는 대출 목록 파싱과 상세 화면이 있다. |
| `docs/reviews/codebase_review.md` | 과거에는 로그인 화면, 탭 라우팅, 대출 라우트가 미구현 또는 불일치로 기록되어 있으나 현재 코드에는 관련 파일이 존재한다. |
| `docs/prd/prd.md` | 초기 PRD다. 현재 라우팅과 Seat Domain 구현 상태는 `prd_v2.md`가 더 가깝다. |
| `docs/seat_reservation_spec.md` | 일부 API 암호화 설명이 `src/api/seatApi.ts`의 현재 구현과 다를 수 있어 실제 MITM 로그 기준 재검토가 필요하다. |

## 즉시 리스크

| 우선순위 | 리스크 | 대응 |
|---|---|---|
| 높음 | `docs/`가 미추적이라 지금까지의 기록이 커밋에 포함되지 않을 수 있다. | 어떤 문서를 보존 대상으로 둘지 결정하고 커밋 범위를 분리한다. |
| 높음 | 문서와 코드 상태가 어긋나 다음 작업의 기준이 흔들릴 수 있다. | `mydocs/report` 기준선을 최신 기준으로 유지한다. |
| 중간 | Loan 연장 기능은 UI 확인창만 있고 실제 API 연결 여부가 불명확하다. | M040에서 별도 Issue로 API/서비스/훅/화면을 검증한다. |
| 중간 | BLE 비콘은 시뮬레이터 검증이 어렵다. | M030에서 실제 기기 검증 절차와 실패 시 fallback 정책을 문서화한다. |

## 다음 마일스톤 후보

| 마일스톤 | 후보 작업 |
|---|---|
| M010 | 기존 `docs` 자료 이관 정책 확정, Git 추적 범위 정리, 최신 프로젝트 현황 보고서 작성 |
| M020 | Auth/User/QR 흐름 회귀 검증, QR 만료/갱신 정책 문서화 및 구현 확인 |
| M030 | Seat API 암호화 정책 재검토, BLE 실제 기기 검증, 좌석 예약/연장/퇴실 회귀 테스트 |
| M040 | Loan 연장 API 역공학, 서비스/훅/화면 연결, 실패 사유 표시 |
| M050 | Expo dev client 빌드 검증, iOS/Android 권한 문서, 배포 전 개인정보/로그 점검 |

## GitHub 작업 단위

초기 마일스톤과 후속 이슈는 `mydocs/report/github_setup_20260429.md`에 기록했다. M010 첫 후속 이슈는 #1이며, `docs`/`mydocs` 추적 정책은 `mydocs/report/docs_tracking_policy_20260429.md`에 정리했다.
