# KNU Library 앱 상태 보고 - 2026-04-29

## 결론

현재 작업 브랜치 `refactor/ui-cleanup` 기준으로 앱은 Auth, User/QR, Seat, Beacon, Loan 목록/상세 UI까지 구현되어 있다. Loan 연장 API는 별도 브랜치 `feat/loan-renewal`의 커밋 `21ea378`에 완료 구현이 존재하지만, 현재 브랜치에는 아직 병합되지 않았다.

따라서 Loan 상태는 "완료 구현 존재"와 "현재 앱 반영"을 분리해서 기록해야 한다.

## 검증

| 항목 | 결과 |
|---|---|
| 현재 브랜치 | `refactor/ui-cleanup` |
| Loan 구현 브랜치 포함 여부 | `feat/loan-renewal`은 현재 HEAD의 ancestor가 아님 |
| TypeScript 검사 | `npx tsc --noEmit` 통과 |
| 남은 미추적 항목 | `Icon Exports/` |

## 도메인별 상태

| 도메인 | 현재 브랜치 상태 | 다음 작업 |
|---|---|---|
| Auth | 구현됨. `GetMyinformation?login=true` 검증, SmartCard 조회, SecureStore 세션 저장, AuthGate 라우팅이 있다. | 실제 계정 로그인 회귀 검증 |
| User/QR | 구현됨. SmartCard 기반 사용자 정보와 QR 렌더링, QR ID 경량 갱신이 있다. | QR 만료 정책과 Pull-to-refresh 동작 문서화 |
| Seat | 구현됨. 상태 조회, 열람실 목록, 좌석맵 파싱, 예약, 좌석 연장, 퇴실 훅/UI가 있다. | API 암호화 정책과 실제 서버/기기 회귀 검증 |
| Beacon | 구현됨. iOS CoreLocation 네이티브 모듈과 Android BLE raw scan 경로가 있다. | 실제 iOS/Android 기기 검증 |
| Loan | 부분 반영. 현재 브랜치에는 목록/상세/연장 버튼 UI가 있고 실제 연장 호출은 비어 있다. | `feat/loan-renewal` 구현 병합/이식 |
| Release/Docs | Hyper-Waterfall 문서 체계와 선별 docs 보존 완료. | 변경사항 push/PR 및 배포 체크리스트 |

## Loan 연장 구현 대조

현재 브랜치의 `app/loan-details.tsx`는 연장 확인 Alert까지 있지만 실제 실행부가 비어 있다.

```tsx
{ text: '연장', onPress: () => { /* extend API */ } }
```

반면 `feat/loan-renewal`에는 다음 구현이 존재한다.

| 파일 | 변경 내용 |
|---|---|
| `src/services/loanService.ts` | `extendRentalBook(bookId)` 추가, `/MyLibrary/Renewal/{bookId}` POST 호출, 성공/실패 HTML 파싱 |
| `src/hooks/queries/useLoan.ts` | `useRenewBookMutation()`, `useExtendDialog()` 추가, 성공 시 Loan query invalidation |
| `src/api/types/book.ts` | 연장 대상 식별용 `id` 필드 추가 |
| `src/components/BookCard.tsx` | 대출 도서 카드 분리, 연장 버튼 처리 |
| `app/loan-details.tsx` | `BookCard`와 `useExtendDialog()`를 사용하도록 연결 |

## 문서 반영 사항

- `mydocs/report/current_state_baseline_20260429.md`: Loan 상태를 "구현 브랜치 존재, 현재 브랜치 미반영"으로 수정
- `mydocs/plans/issue_m040_loan_renewal_completion.md`: "신규 구현"이 아니라 "병합/이식 및 검증" 작업으로 수정
- `docs/reviews/project_status.md`: 최신 상태 보고서로 교체
- `docs/reviews/codebase_review.md`: 최신 코드 리뷰 관점으로 교체
- `docs/prd/prd_v2.md`: Loan Domain 상태 문구 최신화
