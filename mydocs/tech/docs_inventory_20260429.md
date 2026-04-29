# 기존 `docs/` 자료 인벤토리 - 2026-04-29

## 목적

기존 `docs/`는 API 역공학, PRD, 리뷰, 캡처, 빌드 산출물이 섞여 있었다. Hyper-Waterfall 적용 이후에는 새 프로세스 기록을 `mydocs/`에 남기고, `docs/`에는 선별한 Markdown 문서만 보존한다.

## 분류

| 경로 | 성격 | 권장 위치/처리 |
|---|---|---|
| `docs/prd/prd.md` | 초기 PRD | `mydocs/report`에서 과거 기준으로 참조 |
| `docs/prd/prd_v2.md` | 최신에 가까운 PRD | M010에서 최신 코드 기준으로 재작성 후보 |
| `docs/reviews/project_status.md` | 프로젝트 현황 | 최신 코드 기준으로 갱신해 유지 |
| `docs/reviews/codebase_review.md` | 코드 리뷰 | 최신 코드 기준으로 갱신해 유지 |
| `docs/seat_reservation_spec.md` | 좌석 API 명세 | `mydocs/tech`로 정제 이관 후보 |
| `docs/ai_seat_reservation_spec.md` | AI 구현용 좌석 명세 | `mydocs/tech`로 정제 이관 후보 |
| `docs/mitlogs/*.txt` | MITM/API 원본 로그 | 삭제 완료. 재생성 시 Git 추적 제외 |
| `docs/knulib_api.py`, `docs/knulib_api_dec.py` | 참조 구현/역공학 코드 | 삭제 완료. 필요한 내용만 Markdown으로 정제 |
| `docs/capture/*.PNG` | 화면 캡처 | 삭제 완료. 재생성 시 개인정보 검토 후 별도 관리 |
| `docs/build-1774833724127.apk` | 빌드 산출물 | 삭제 완료. 필요 시 Release artifact 등으로 관리 |
| `docs/privacy_policy.md` | 개인정보 처리방침 | M050 배포 문서로 재검토 |
| `docs/walkthrough/walkthrough_031601.md` | 과거 구현 검토 | `mydocs/working` 참조 후보 |

## 이관 원칙

1. 원본 로그와 캡처가 다시 생기면 Git에 추가하지 않는다.
2. 새 문서에는 원본의 민감정보를 그대로 복사하지 않는다.
3. PRD와 리뷰 문서는 최신 코드 기준으로 갱신하되, 과거 문서는 역사적 성격을 명시한다.
4. APK 같은 바이너리 산출물은 Git에 포함하지 않고 Release artifact 등으로 관리한다.
5. 원본 API 로그, APK, 캡처, 참조 Python은 기본 Git 추적 대상에서 제외한다.

## 우선순위

| 순위 | 작업 |
|---|---|
| 1 | `docs/reviews/project_status.md`와 `docs/reviews/codebase_review.md` 최신화 |
| 2 | 좌석 API 명세를 `mydocs/tech/seat_api_spec.md`로 정제 |
| 3 | 재생성되는 MITM 로그 민감정보 점검 |
| 4 | Loan Domain 실제 구현 상태를 별도 보고서로 정리 |
| 5 | 배포 산출물과 캡처의 외부 보관 정책 결정 |

## 결정 사항

2026-04-29 기준 `mydocs/report/docs_tracking_policy_20260429.md`에 Git 추적 정책을 작성했고, `.gitignore`에 제외 대상을 반영했다.
