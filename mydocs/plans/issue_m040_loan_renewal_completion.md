# Loan 연장 API 병합 및 대출 도메인 검증

## 목표

`feat/loan-renewal` 브랜치에 완료된 도서 연장 API 구현을 현재 브랜치에 병합 또는 이식하고, 대출 도메인의 현재 목록/상세/연장 흐름을 검증한다.

## 범위

- `src/services/loanService.ts` HTML 파싱 검증
- `src/hooks/queries/useLoan.ts` 쿼리 키와 캐시 정책 확인
- `src/components/LoanSummaryCard.tsx`와 `app/loan-details.tsx` UI 상태 확인
- `feat/loan-renewal`의 `extendRentalBook()`, `useRenewBookMutation()`, `useExtendDialog()`, `BookCard` 변경을 현재 브랜치에 병합/이식
- 연장 가능 도서의 실제 연장 API 호출, 성공/실패 메시지, 목록 invalidation 검증

## 검증

- 현재 대출 목록과 전체 대출 기록이 구분되어야 한다.
- 연장 가능/불가 상태가 서버 응답 기준으로 표시되어야 한다.
- 연장 요청 성공/실패 메시지가 사용자에게 전달되어야 한다.
- `npx tsc --noEmit`이 통과해야 한다.

## 참고

- `mydocs/report/current_state_baseline_20260429.md`
- `docs/prd/prd_v2.md`
- `feat/loan-renewal` 커밋 `21ea378`
