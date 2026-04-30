# Task M030 #12 Stage 5 완료보고서 - 재진입 비콘 실패 팝업 중복 방지

GitHub Issue: https://github.com/postmelee/knu_lib/issues/12

## 단계 목적

비콘 인증 실패 후 열람실 목록으로 돌아갔다가 같은 좌석 예약 화면에 다시 진입할 때, 이전 `beacon-auth` query 실패 상태가 즉시 팝업으로 재노출되는 문제를 막는다. 새 화면 진입에서 실제로 시작된 비콘 인증 시도가 실패한 경우에만 안내 팝업을 최대 1회 표시한다.

## 산출물

| 파일 | 변경 내용 |
|------|-----------|
| `src/screens/SeatReservationScreen.tsx` | 비콘 실패 팝업 조건을 `isFetchedAfterMount`와 1회 표시 ref 기준으로 제한 |
| `src/screens/SeatReservationScreen.tsx` | 비콘 인증 진행 판단을 `isLoading` 대신 `isFetching` 기준으로 조정 |
| `mydocs/report/task_m030_12_report.md` | 최종 결과보고서에 재진입 팝업 중복 방지 반영 |
| `mydocs/orders/20260430.md` | Task #12 완료 비고 갱신 |

## 본문 변경 정도 또는 본문 무손실 여부

비콘 인증 실패 후 좌석 조회 전용 모드로 남는 정책은 유지했다. `비콘 인증 후 예약 가능` 버튼 문구, 예약 시도 시 `비콘 인증 필요` 안내, 서버 예약 요청 차단도 변경하지 않았다.

이번 단계는 실패 알림의 발생 조건만 좁혔다. React Query에 남아 있는 이전 실패 상태는 조회 전용 UI 판단에는 사용할 수 있지만, 팝업 표시에는 사용하지 않는다. 팝업은 현재 화면 마운트 이후 실제 fetch가 완료되어 실패한 경우에만 표시한다.

## 검증 결과

| 검증 | 결과 | 비고 |
|------|------|------|
| `npx tsc --noEmit` | 통과 | TypeScript 오류 없음 |
| `rg -n "isFetchedAfterMount|hasShownBeaconFailureAlertRef|isFetching|isLoading" src/screens/SeatReservationScreen.tsx` | 통과 | 새 팝업 조건과 `isFetching` 기반 로딩 기준 확인 |
| `git diff --check` | 통과 | 공백 오류 없음 |

## 잔여 위험

- 실제 도서관 현장 비콘 실패 상황은 이번 단계에서 직접 재현하지 않았다.
- 비콘 인증 성공 캐시는 기존 `useAutoBeaconAuth` query key와 `staleTime` 정책을 유지한다. 이번 단계는 실패 팝업 재노출만 제한한다.

## 다음 단계 영향

Task #12의 조회 전용 UX는 유지하면서 재진입 시 중복 팝업 문제를 보정했다. 검증 완료 후 Stage 5 보정 커밋으로 기록한다.
