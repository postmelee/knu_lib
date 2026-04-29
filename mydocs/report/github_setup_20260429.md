# GitHub 초기 설정 결과 - 2026-04-29

## 결과

Hyper-Waterfall 운영을 위해 GitHub 마일스톤 5개와 후속 이슈 5개를 생성했다. 저장소는 `postmelee/knu_lib`이며 기본 브랜치는 `master`다.

GitHub 앱 커넥터는 이 저장소에서 이슈 생성 권한이 없어 403을 반환했다. 실제 생성은 인증된 `gh` CLI로 수행했다.

## 마일스톤

| 마일스톤 | GitHub 번호 | URL |
|---|---:|---|
| M010 — 현황 기준선 및 문서 체계 | 1 | https://github.com/postmelee/knu_lib/milestone/1 |
| M020 — 인증/사용자/QR 안정화 | 5 | https://github.com/postmelee/knu_lib/milestone/5 |
| M030 — 좌석/비콘 안정화 | 3 | https://github.com/postmelee/knu_lib/milestone/3 |
| M040 — 대출 도메인 완성 | 2 | https://github.com/postmelee/knu_lib/milestone/2 |
| M050 — 배포/품질 관문 | 4 | https://github.com/postmelee/knu_lib/milestone/4 |

## 이슈

| Issue | 마일스톤 | 제목 | URL |
|---:|---|---|---|
| #1 | M010 | docs/mydocs 추적 범위 정리 및 최신 현황 보고서 작성 | https://github.com/postmelee/knu_lib/issues/1 |
| #3 | M020 | Auth/User/QR 흐름 회귀 검증 및 QR 갱신 정책 정리 | https://github.com/postmelee/knu_lib/issues/3 |
| #4 | M030 | Seat API 암호화/비콘/좌석 액션 회귀 검증 | https://github.com/postmelee/knu_lib/issues/4 |
| #5 | M040 | Loan 연장 API 병합 및 대출 도메인 검증 | https://github.com/postmelee/knu_lib/issues/5 |
| #2 | M050 | Expo dev client 빌드/권한/배포 품질 관문 정리 | https://github.com/postmelee/knu_lib/issues/2 |

## 로컬 계획서

각 이슈 본문은 `mydocs/plans/issue_m*.md`에도 같은 내용으로 저장했다. GitHub 이슈를 수정하거나 세분화할 때 이 파일을 출처로 사용한다.

## 다음 실행 순서

1. #1에서 `docs/` 추적 범위와 보존 정책을 결정한다.
2. #1 완료 후 최신 프로젝트 현황 보고서를 `mydocs/report`에 추가한다.
3. 이후 #4 또는 #5 중 실제 리스크가 큰 도메인을 우선 착수한다.
