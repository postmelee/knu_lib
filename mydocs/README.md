# KNU Library mydocs

이 디렉토리는 KNU Library 앱 개발을 Hyper-Waterfall 방식으로 진행하기 위한 작업 기록이다. 기존 `docs/`가 API 조사 자료, 캡처, 과거 보고서의 원본 보관소라면, `mydocs/`는 앞으로의 계획, 진행, 검증, 피드백을 남기는 운영 기록이다.

## 구조

| 디렉토리 | 용도 |
|---|---|
| `orders/` | 날짜별 오늘 할일. `yyyymmdd.md` 형식. |
| `plans/` | Issue 단위 수행 계획서와 구현 계획서. |
| `working/` | 단계별 완료 보고서와 최종 보고서. |
| `report/` | 프로젝트 현황, 기준선, 릴리즈 보고서. |
| `feedback/` | 코드 리뷰 피드백과 반영 내역. |
| `tech/` | API, 암호화, 비콘, HTML 파싱 등 기술 문서. |
| `manual/` | 개발 방법론과 운영 규칙. |
| `troubleshootings/` | 장애, 실패, 재현, 해결 기록. |

## 시작점

- 운영 규칙: `mydocs/manual/hyper_waterfall_knu_library.md`
- 현재 기준선: `mydocs/report/current_state_baseline_20260429.md`
- 앱 상태 보고: `mydocs/report/app_status_20260429.md`
- GitHub 초기 설정: `mydocs/report/github_setup_20260429.md`
- docs 추적 정책: `mydocs/report/docs_tracking_policy_20260429.md`
- 기존 문서 인벤토리: `mydocs/tech/docs_inventory_20260429.md`
- 오늘 작업판: `mydocs/orders/20260429.md`

## 원칙

- 새 개발 작업은 Issue 단위로 분리한다.
- 구현 전 계획서, 구현 후 검증 보고서를 남긴다.
- 기존 `docs/` 원본은 임의로 수정하거나 이동하지 않는다.
- 실제 코드 상태와 문서가 다르면 `mydocs/report` 기준선을 우선 갱신한다.
