# Task M030 #12 Stage 4 완료보고서 - 조회 전용 상단 안내 제거

GitHub Issue: https://github.com/postmelee/knu_lib/issues/12

## 단계 목적

실기기 확인 과정에서 상단 조회 전용 안내 영역이 좌석 목록을 아래로 밀어내 좌석맵 가시성을 해칠 수 있다는 피드백을 반영한다. 기존 조회 전용 정책은 유지하되, 좌석 화면의 핵심 정보인 좌석 목록을 우선 노출한다.

## 산출물

| 파일 | 변경 내용 |
|------|-----------|
| `src/screens/SeatReservationScreen.tsx` | `isBeaconViewOnly` 상단 안내 영역 제거 |
| `src/screens/SeatReservationScreen.tsx` | `viewOnlyNotice`, `viewOnlyNoticeTitle` 스타일 제거 |
| `mydocs/report/task_m030_12_report.md` | 최종 결과보고서를 버튼 문구와 예약 시도 안내 기준으로 갱신 |
| `mydocs/orders/20260430.md` | Task #12 완료 비고를 피드백 반영 기준으로 갱신 |

## 본문 변경 정도 또는 본문 무손실 여부

비콘 인증 실패 팝업의 `확인` 버튼, 좌석 목록 조회 유지, `비콘 인증 후 예약 가능` 버튼 문구, 예약 시도 시 `비콘 인증 필요` 안내와 서버 요청 차단은 그대로 유지했다.

제거한 범위는 좌석맵 위에 표시되던 별도 안내 영역과 해당 스타일뿐이다. 이로써 작은 화면에서도 좌석 목록이 안내 영역 때문에 밀려 보이지 않는 상황을 줄인다.

## 검증 결과

| 검증 | 결과 | 비고 |
|------|------|------|
| `npx tsc --noEmit` | 통과 | TypeScript 오류 없음 |
| `rg -n "viewOnlyNotice|조회 전용 모드" src/screens/SeatReservationScreen.tsx` | 통과 | 검색 결과 없음 |
| `git diff --check` | 통과 | 공백 오류 없음 |

## 잔여 위험

- 실제 도서관 현장 비콘 실패 상황은 이번 단계에서 직접 재현하지 않았다.
- 상단 안내 영역을 제거했기 때문에 조회 전용 상태의 사전 인지는 버튼 문구에 의존한다. 예약을 시도하면 별도 안내 팝업으로 이유를 다시 설명한다.

## 다음 단계 영향

Task #12 구현 범위는 유지하면서 실기기 피드백을 반영했다. 검증 완료 후 Stage 4 보정 커밋으로 기록한다.
