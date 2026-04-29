# 기존 `docs/` 자료 인벤토리 - 2026-04-29

## 목적

기존 `docs/`는 API 역공학, PRD, 리뷰, 캡처, 빌드 산출물이 섞여 있다. Hyper-Waterfall 적용 이후에는 새 프로세스 기록을 `mydocs/`에 남기되, `docs/` 원본 자료는 조사 증거로 유지한다.

## 분류

| 경로 | 성격 | 권장 위치/처리 |
|---|---|---|
| `docs/prd/prd.md` | 초기 PRD | `mydocs/report`에서 과거 기준으로 참조 |
| `docs/prd/prd_v2.md` | 최신에 가까운 PRD | M010에서 최신 코드 기준으로 재작성 후보 |
| `docs/reviews/project_status.md` | 과거 프로젝트 현황 | `mydocs/report` 기준선으로 대체하되 원본 유지 |
| `docs/reviews/codebase_review.md` | 과거 코드 리뷰 | `mydocs/feedback`로 요약 이관 후보 |
| `docs/seat_reservation_spec.md` | 좌석 API 명세 | `mydocs/tech`로 정제 이관 후보 |
| `docs/ai_seat_reservation_spec.md` | AI 구현용 좌석 명세 | `mydocs/tech`로 정제 이관 후보 |
| `docs/mitlogs/*.txt` | MITM/API 원본 로그 | 원본 증거로 유지. 민감정보 포함 여부 점검 필요 |
| `docs/knulib_api.py`, `docs/knulib_api_dec.py` | 참조 구현/역공학 코드 | `mydocs/tech`에서 참조 관계만 문서화 |
| `docs/capture/*.PNG` | 화면 캡처 | 검증 증거로 유지 |
| `docs/build-1774833724127.apk` | 빌드 산출물 | Git 포함 여부 별도 결정 필요 |
| `docs/privacy_policy.md` | 개인정보 처리방침 | M050 배포 문서로 재검토 |
| `docs/walkthrough/walkthrough_031601.md` | 과거 구현 검토 | `mydocs/working` 참조 후보 |

## 이관 원칙

1. 원본 로그와 캡처는 수정하지 않는다.
2. 새 문서에는 원본의 민감정보를 그대로 복사하지 않는다.
3. PRD와 리뷰 문서는 최신 코드 기준으로 새 기준선 문서를 만들고, 과거 문서는 출처로만 둔다.
4. APK 같은 바이너리 산출물은 Git 추적 전에 필요성과 크기를 검토한다.
5. 원본 API 로그, APK, 캡처, 참조 Python은 기본 Git 추적 대상에서 제외한다.

## 우선순위

| 순위 | 작업 |
|---|---|
| 1 | `docs/reviews/project_status.md`를 최신 코드 기준 `mydocs/report` 문서로 대체 |
| 2 | 좌석 API 명세를 `mydocs/tech/seat_api_spec.md`로 정제 |
| 3 | MITM 로그 민감정보 점검 |
| 4 | Loan Domain 실제 구현 상태를 별도 보고서로 정리 |
| 5 | 배포 산출물과 캡처의 Git 추적 정책 결정 |

## 결정 사항

2026-04-29 기준 `mydocs/report/docs_tracking_policy_20260429.md`에 Git 추적 정책을 작성했고, `.gitignore`에 제외 대상을 반영했다.
