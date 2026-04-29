# KNU Library 코드베이스 검토 보고서

> 작성일: 2026-04-29 | 기준 브랜치: `refactor/ui-cleanup`

## 1. 요약

현재 코드베이스는 초기 리뷰 문서보다 훨씬 진행되어 있다. 로그인, SmartCard/QR, 좌석 도메인, 열람실/좌석맵 UI, 대출 목록/상세 화면은 현재 브랜치에 존재한다.

가장 중요한 최신 판단은 Loan Domain이다. Loan 연장 API는 `feat/loan-renewal` 브랜치에서 구현 완료되어 있으나 현재 브랜치에는 아직 병합되지 않았다. 현재 브랜치만 보면 연장 버튼의 실제 API 호출부가 비어 있다.

## 2. 아키텍처 준수 여부

프로젝트는 대체로 다음 레이어 구조를 유지한다.

```text
src/api/types/   -> API/도메인 타입
src/api/         -> Axios 기반 API 호출
src/services/    -> 인증 주입, HTML 파싱, 상태 매핑 등 비즈니스 로직
src/hooks/       -> React Query 훅
src/components/  -> 프레젠테이션 컴포넌트
src/screens/     -> 화면 조합
app/             -> Expo Router 라우트
```

| 영역 | 평가 |
|---|---|
| Auth/User | 서비스와 훅 분리가 양호하다. `fetchUserProfile()` mock은 현재 핵심 흐름에서 사용되지 않는 잔여 코드로 보인다. |
| Seat | API/Service/Hook/UI 레이어가 분리되어 있다. 비콘과 transient beacon state는 회귀 검증이 필요하다. |
| Loan | 목록/상세는 현재 브랜치에 있고, 연장 구현은 별도 브랜치에 있다. 병합 후 구조가 더 깔끔해진다. |
| UI | 홈 대시보드, 좌석 상태, 열람실 목록, 좌석맵, 대출 상세 화면이 존재한다. |

## 3. 현재 발견된 이슈

| 우선순위 | 내용 | 파일 |
|---|---|---|
| 높음 | Loan 연장 API 구현이 현재 브랜치에 미반영. `feat/loan-renewal`의 구현을 병합/이식해야 한다. | `app/loan-details.tsx`, `src/services/loanService.ts`, `src/hooks/queries/useLoan.ts` |
| 높음 | Seat API 암호화 정책이 문서와 코드 사이에 차이가 있어 실제 MITM/서버 기준으로 재검증해야 한다. | `docs/seat_reservation_spec.md`, `src/api/seatApi.ts` |
| 중간 | 비콘 인증은 iOS/Android 코드가 있지만 실제 기기 검증 결과가 문서화되어 있지 않다. | `src/services/beaconService.ts`, `modules/beacon-ranging/` |
| 중간 | `DashboardScreen`과 일부 좌석 예약 화면에 영어 fallback 문구가 남아 있다. | `src/screens/DashboardScreen.tsx` |
| 낮음 | `fetchUserProfile()` mock이 남아 있다. 실제 SmartCard 흐름으로 대체되어 있으면 정리 가능하다. | `src/services/userService.ts` |

## 4. Loan 연장 브랜치 대조

`feat/loan-renewal` 커밋 `21ea378`은 다음 변경을 포함한다.

| 파일 | 구현 내용 |
|---|---|
| `src/services/loanService.ts` | `extendRentalBook(bookId)` 추가, `/MyLibrary/Renewal/{bookId}` POST 호출, 실패 HTML 메시지 파싱 |
| `src/hooks/queries/useLoan.ts` | `useRenewBookMutation()`, `useExtendDialog()` 추가 |
| `src/api/types/book.ts` | 연장 대상 식별용 `id` 필드 추가 |
| `src/components/BookCard.tsx` | 도서 카드와 연장 버튼 컴포넌트 분리 |
| `app/loan-details.tsx` | `BookCard`와 연장 다이얼로그 연결 |

현재 브랜치에는 위 변경이 없으므로, #5의 실제 작업은 신규 구현이 아니라 **브랜치 병합/이식 및 회귀 검증**이다.

## 5. 검증

| 검증 | 결과 |
|---|---|
| TypeScript | `npx tsc --noEmit` 통과 |
| Git 상태 | 브랜치 `refactor/ui-cleanup`, 원격보다 2커밋 ahead |
| 원본 docs 정리 | APK/MITM 로그/캡처 삭제, Markdown 문서만 보존 |

## 6. 권장 다음 순서

1. #5: `feat/loan-renewal`의 5개 파일 변경을 현재 브랜치에 병합/이식한다.
2. 병합 후 `npx tsc --noEmit`과 대출 상세 화면 수동 검증을 수행한다.
3. #4: Seat/Beacon 실제 서버/기기 검증을 진행한다.
4. #3: Auth/User/QR 회귀 검증과 QR 만료 정책을 확정한다.
