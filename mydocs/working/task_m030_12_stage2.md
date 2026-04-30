# Task M030 #12 Stage 2 완료보고서 - 좌석 조회 전용 안내 UI 추가

GitHub Issue: https://github.com/postmelee/knu_lib/issues/12

## 단계 목적

비콘 미인증 상태에서 사용자가 좌석 예약 화면이 조회 전용이라는 점을 화면 안에서 즉시 이해하게 한다. 좌석 현황 조회는 유지하되, 예약 버튼 문구와 비활성 상태가 예약 불가 사유와 일치하도록 정리한다.

## 산출물

| 파일 | 변경 내용 |
|------|-----------|
| `src/screens/SeatReservationScreen.tsx` | `isBeaconViewOnly` 상태에서 조회 전용 안내 영역 표시 |
| `src/screens/SeatReservationScreen.tsx` | 조회 전용 상태의 예약 버튼 문구를 `비콘 인증 후 예약 가능`으로 변경 |
| `src/screens/SeatReservationScreen.tsx` | 안내 영역 스타일 `viewOnlyNotice`, `viewOnlyNoticeTitle` 추가 |

## 본문 변경 정도 또는 본문 무손실 여부

좌석 데이터 조회, 좌석맵 렌더링, 좌석 선택, 예약 API 호출 흐름은 변경하지 않았다. 이번 단계는 비콘 실패 상태에서 표시되는 안내 UI와 버튼 문구만 추가했다.

안내 영역은 좌석 선택 헤더와 좌석맵 사이에 배치했다. 좌석맵의 스크롤 구조와 크기 계산 로직은 유지했고, 안내 영역은 `marginHorizontal: 24`, `marginBottom: 12`, `paddingVertical: 12`로 제한해 좌석맵 영역을 과도하게 밀어내지 않도록 했다.

## 검증 결과

| 검증 | 결과 | 비고 |
|------|------|------|
| `npx tsc --noEmit` | 통과 | 분리 worktree에 `node_modules`가 없어 원본 worktree의 설치본을 symlink로 임시 연결한 뒤 실행. 검증 후 symlink 제거 |
| `rg -n "조회 전용 모드|비콘 인증 후 예약 가능|도서관 위치 확인 중|권한 확인 중|isBeaconViewOnly|viewOnlyNotice|disabled=\\{isButtonDisabled\\(\\)\\}" src/screens/SeatReservationScreen.tsx` | 통과 | 조회 전용 안내, 상태별 버튼 문구, disabled 연결 확인 |
| `git diff --check` | 통과 | 공백 오류 없음 |

## 잔여 위험

- 조회 전용 상태에서 예약 액션이 직접 호출될 경우의 안내 guard는 Stage 3 범위라 아직 추가하지 않았다. 현재 UI 버튼은 disabled 상태이므로 일반 터치 흐름에서는 예약 액션이 실행되지 않는다.
- 비콘 재시도 버튼은 구현계획서의 보류 대안으로 남겼다. React Query error/reset 동작 범위가 커질 수 있어 Stage 2에는 포함하지 않았다.
- 실제 모바일 화면에서 안내 영역의 시각적 위치는 코드 기준으로만 점검했다. 시뮬레이터 또는 실기기 시각 검증은 아직 수행하지 않았다.

## 다음 단계 영향

Stage 3에서는 조회 전용 상태에서 예약 시도 안내 guard를 보강하고, 최종 회귀 확인 및 최종 결과보고서를 작성하면 된다. Stage 2에서 `isBeaconViewOnly` 안내와 버튼 문구가 들어갔으므로 Stage 3은 동작 guard와 보고 정리에 집중할 수 있다.

## 승인 요청

Stage 2 완료를 보고한다. Stage 3 `조회 전용 예약 시도 안내와 최종 회귀 확인`으로 진행해도 되는지 승인 요청한다.
