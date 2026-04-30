# Task M030 #12 Stage 1 완료보고서 - 비콘 실패 조회 상태 기반 정리

GitHub Issue: https://github.com/postmelee/knu_lib/issues/12

## 단계 목적

비콘 인증 실패를 좌석 예약 화면의 이탈 조건에서 분리한다. Stage 2에서 조회 전용 안내 UI를 붙일 수 있도록 비콘 진행 중 상태와 비콘 실패 조회 전용 상태를 파생 상태로 정리한다.

## 산출물

| 파일 | 변경 내용 |
|------|-----------|
| `src/screens/SeatReservationScreen.tsx` | `isBeaconChecking`, `isBeaconViewOnly` 파생 상태 추가 |
| `src/screens/SeatReservationScreen.tsx` | `도서관 밖이신가요?` 팝업 버튼을 `확인`으로 변경하고 `router.back()` 제거 |
| `src/screens/SeatReservationScreen.tsx` | 좌석 클릭의 인증 진행 중 차단과 예약 버튼 loading/disabled 조건을 파생 상태 기반으로 정리 |

## 본문 변경 정도 또는 본문 무손실 여부

좌석 데이터 조회, 좌석맵 렌더링, 비콘 인증 요청, 예약 API 호출 흐름은 변경하지 않았다. 이번 단계는 비콘 인증 실패 시 화면을 유지하도록 팝업 동작과 UI 상태 판정만 최소 변경했다.

권한 필요 및 권한 확인 실패 팝업의 `뒤로 가기` 동작은 Stage 1 범위 밖이라 유지했다. 해당 동작은 사용자가 권한을 거부하거나 권한 확인 자체가 실패한 경우에 해당한다.

## 검증 결과

| 검증 | 결과 | 비고 |
|------|------|------|
| `npx tsc --noEmit` | 통과 | 분리 worktree에 `node_modules`가 없어 원본 worktree의 설치본을 symlink로 임시 연결한 뒤 실행. 검증 후 symlink 제거 |
| `rg -n "도서관 밖이신가요|확인|isBeaconChecking|isBeaconViewOnly|router\\.back\\(\\)" src/screens/SeatReservationScreen.tsx` | 통과 | 비콘 실패 팝업은 `확인` 버튼만 남고 `router.back()` 제거됨 |
| `git diff --check` | 통과 | 공백 오류 없음 |

검증 중 첫 `npx tsc --noEmit` 실행은 분리 worktree에 `node_modules`가 없어 `npx`가 registry의 `tsc@2.0.4`를 찾으려 하며 실패했다. 이후 gitignore 대상인 `node_modules` symlink를 임시 생성해 프로젝트의 `typescript`로 타입 검사를 통과시켰고, symlink는 제거했다.

## 잔여 위험

- 조회 전용 상태에서 사용자에게 보이는 안내 문구와 예약 버튼 문구는 Stage 2 범위라 아직 완성되지 않았다.
- 권한 거부 상황은 여전히 열람실 목록으로 돌아갈 수 있다. 이번 단계는 비콘 인증 실패 팝업만 대상으로 했다.

## 다음 단계 영향

Stage 2는 `isBeaconViewOnly`를 사용해 좌석 예약 화면에 조회 전용 안내 영역을 추가하고, 예약 버튼 문구를 상태별로 정리하면 된다. Stage 1에서 비콘 실패 시 화면 유지가 보장되므로 안내 UI를 같은 화면 안에 배치할 수 있다.

## 승인 요청

Stage 1 완료를 보고한다. Stage 2 `조회 전용 안내 UI와 예약 버튼 문구 구현`으로 진행해도 되는지 승인 요청한다.
