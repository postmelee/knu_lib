# Loan 연장 API 및 대출 도메인 검증

## 목표

현재 코드에 반영된 도서 연장 API 구현을 실제 계정/서버 기준으로 검증하고, 대출 도메인의 목록/상세/연장 흐름을 안정화한다.

## 범위

- `src/services/loanService.ts` HTML 파싱 검증
- `src/hooks/queries/useLoan.ts` 쿼리 키, mutation, cache invalidation 확인
- `src/components/LoanSummaryCard.tsx`, `src/components/BookCard.tsx`, `app/loan-details.tsx` UI 상태 확인
- `extendRentalBook()`, `useRenewBookMutation()`, `useExtendDialog()`의 성공/실패 처리 확인
- 연장 가능 도서의 실제 연장 API 호출, 성공/실패 메시지, 목록 invalidation 검증

## 검증

- 현재 대출 목록과 전체 대출 기록이 구분되어야 한다.
- 연장 가능/불가 상태가 서버 응답 기준으로 표시되어야 한다.
- 연장 요청 성공/실패 메시지가 사용자에게 전달되어야 한다.
- 연장 성공 후 대출 목록 query가 갱신되어야 한다.
- `npx tsc --noEmit`이 통과해야 한다.

## 참고

- `mydocs/report/current_state_baseline_20260429.md`
- `docs/prd/prd_v2.md`
- `src/services/loanService.ts`
- `src/hooks/queries/useLoan.ts`
