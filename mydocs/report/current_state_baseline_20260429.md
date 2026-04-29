# KNU Library 현재 상태 기준선 - 2026-04-29

## 요약

KNU Library 앱은 Hyper-Waterfall 적용에 적합하다. API 역공학과 모바일 네이티브 기능이 섞여 있어, 구현 전에 계획과 검증 기준을 문서화하는 방식이 실질적인 리스크를 줄인다.

초기 진단 당시 저장소에는 `docs/`에 PRD, 좌석 예약 명세, MITM 로그, 코드 리뷰 보고서가 섞여 있었고 `mydocs/` 운영 구조가 없었다. 이후 `mydocs/`를 공식 작업 기록으로 도입했고, `docs/`는 Markdown 문서만 선별 보존하는 상태로 정리했다. 원본 로그, APK, 캡처, 참조 Python은 Git 추적 대상에서 제외했고 현재 작업 기준에서는 삭제되어 있다.

## 저장소 상태

| 항목 | 현재 |
|---|---|
| 기준 브랜치 | `devel` |
| 현재 작업 브랜치 | `local/task4` |
| 원격 저장소 | `https://github.com/postmelee/knu_lib.git` |
| 앱 스택 | React Native + Expo SDK 55, Expo Router, React Query, Axios, TypeScript |
| 로컬 문서 | `docs/` Markdown 선별 보존, `mydocs/` 공식 작업 기록 |

## 구현 상태

| 도메인 | 현재 코드 기준 상태 | 주요 파일 |
|---|---|---|
| Auth | 구현됨. `SecureStore` 기반 세션 저장과 AuthGate 라우팅이 존재한다. | `src/services/authService.ts`, `src/hooks/queries/useAuth.ts`, `app/_layout.tsx`, `app/login.tsx` |
| User/QR | 구현됨. SmartCard 기반 사용자 표시와 QR 카드가 존재한다. | `src/services/userService.ts`, `src/hooks/queries/useUser.ts`, `src/components/StudentCard.tsx` |
| Seat | 구현됨. 상태 조회, 열람실 목록, 좌석맵 파싱, 예약/연장/퇴실 훅이 존재한다. | `src/api/seatApi.ts`, `src/services/seatService.ts`, `src/hooks/queries/useSeat.ts`, `src/components/SeatStatusCard.tsx` |
| Beacon | 구현됨. iOS/Android 모두 `modules/beacon-ranging` native module 경로를 사용한다. 실제 기기 검증 기록은 별도 필요하다. | `modules/beacon-ranging/`, `src/services/beaconService.ts` |
| Loan | 구현됨. 대출 목록/상세, `/MyLibrary/Renewal/{bookId}` 연장 API, mutation hook, 연장 UI가 현재 코드에 반영되어 있다. | `src/services/loanService.ts`, `src/hooks/queries/useLoan.ts`, `src/components/LoanSummaryCard.tsx`, `src/components/BookCard.tsx`, `app/loan-details.tsx` |

## 기존 문서와 코드의 차이

| 문서 | 차이 |
|---|---|
| `docs/reviews/project_status.md` | 최신 기준으로 갱신되어 있다. Android beacon은 native module 기준, Loan은 현재 코드 구현 완료 기준으로 본다. |
| `docs/reviews/codebase_review.md` | 최신 코드 기준 리뷰로 갱신되어 있다. |
| `docs/prd/prd.md` | 초기 PRD다. 현재 라우팅과 Seat/Beacon/Loan 구현 상태는 `prd_v2.md`와 `mydocs/report/app_status_20260429.md`를 우선한다. |
| `docs/seat_reservation_spec.md` | 현재 구현은 Sponge 암호화 기준이다. 실제 서버/기기 회귀 검증은 M030에서 이어간다. |

## 즉시 리스크

| 우선순위 | 리스크 | 대응 |
|---|---|---|
| 완료 | `docs/`/`mydocs/` 추적 범위가 불명확했다. | `mydocs/`와 선별 Markdown 문서를 커밋했고 원본 로그/APK/캡처를 삭제했다. |
| 높음 | Android 비콘은 native module로 전환되었지만 실제 기기 검증이 없다. | M030에서 실제 Android 기기 검증 절차와 실패 시 fallback 정책을 문서화한다. |
| 높음 | Seat API 암호화/파라미터 정책은 실제 서버 회귀 검증이 필요하다. | M030에서 실제 계정으로 예약/연장/퇴실 흐름을 검증한다. |
| 중간 | Loan 연장 구현은 현재 코드에 반영되어 있지만 실제 서버 성공/실패 메시지 검증이 남아 있다. | M040에서 연장 가능/불가 케이스와 목록 invalidation을 확인한다. |

## 다음 마일스톤 후보

| 마일스톤 | 후보 작업 |
|---|---|
| M010 | 기존 `docs` 자료 이관 정책 확정, Git 추적 범위 정리, 최신 프로젝트 현황 보고서 작성 |
| M020 | Auth/User/QR 흐름 회귀 검증, QR 만료/갱신 정책 문서화 및 구현 확인 |
| M030 | Seat API 암호화 정책 재검토, BLE 실제 기기 검증, 좌석 예약/연장/퇴실 회귀 테스트 |
| M040 | Loan 연장 성공/실패 메시지, 서비스/훅/화면 회귀 검증, 실패 사유 표시 확인 |
| M050 | Expo dev client 빌드 검증, iOS/Android 권한 문서, 배포 전 개인정보/로그 점검 |

## 검증 결과

| 검증 | 결과 |
|---|---|
| TypeScript | `npx tsc --noEmit` 통과 |
| Android autolinking | `npx expo-modules-autolinking resolve --platform android`에서 `beacon-ranging` 확인 |
| Android debug build | `./gradlew :app:assembleDebug` 통과 |

## GitHub 작업 단위

초기 마일스톤과 후속 이슈는 `mydocs/report/github_setup_20260429.md`에 기록했다. M010 첫 후속 이슈는 #1이며, `docs`/`mydocs` 추적 정책은 `mydocs/report/docs_tracking_policy_20260429.md`에 정리했다.
