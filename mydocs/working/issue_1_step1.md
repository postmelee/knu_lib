# Issue #1 Step 1 - docs/mydocs 추적 정책 정리

## 결과

`docs/`와 `mydocs/`의 Git 추적 정책을 정리했다. `mydocs/`는 공식 개발 기록으로 추적 대상이며, 기존 `docs/`는 정제 문서만 선별 추적한다.

GitHub 진행 기록: https://github.com/postmelee/knu_lib/issues/1#issuecomment-4340459203

## 변경

- `.gitignore`에 원본 로그, APK, 캡처, 참조 Python 제외 패턴 추가
- `mydocs/report/docs_tracking_policy_20260429.md` 작성
- `mydocs/tech/docs_inventory_20260429.md`에 결정 사항 반영
- `mydocs/report/current_state_baseline_20260429.md`에 GitHub 작업 단위와 추적 정책 링크 반영

## 검증

- `docs/` 총 크기: 약 94MB
- APK 산출물: 약 92MB
- MITM 로그: 약 1.2MB
- `git status --ignored --short docs`로 제외 패턴 적용 확인
- `git status --short --untracked-files=all docs`로 추적 후보 문서 목록 확인

## 추적 후보

```text
docs/ai_seat_reservation_spec.md
docs/prd/prd.md
docs/prd/prd_v2.md
docs/privacy_policy.md
docs/reviews/codebase_review.md
docs/reviews/project_status.md
docs/seat_reservation_spec.md
docs/walkthrough/walkthrough_031601.md
docs/학술제/body.md
```

## 남은 작업

후속 정리에서 선별 Markdown 문서는 커밋했고, 원본 로그/APK/캡처/참조 Python은 삭제 및 `.gitignore` 제외 대상으로 확정했다. 원본 로그의 정제본 작성은 #4 Seat API 검증 작업에서 필요할 때 로컬 재수집 후 이어간다.
