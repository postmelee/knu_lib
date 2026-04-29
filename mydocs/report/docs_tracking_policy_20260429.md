# docs/mydocs Git 추적 정책 - 2026-04-29

## 결론

`mydocs/`는 앞으로의 공식 개발 기록으로 Git 추적 대상에 포함한다. 기존 `docs/`는 전체를 추적하지 않고, 정제된 문서만 선별적으로 포함한다.

원본 API 로그, MITM 응답, 참조 Python, APK, 캡처 이미지는 로컬 조사 자료로 유지하되 기본 Git 추적 대상에서 제외한다.

## 근거

| 항목 | 확인 결과 | 정책 |
|---|---|---|
| `docs/build-1774833724127.apk` | 약 92MB 바이너리 산출물 | 제외 |
| `docs/mitlogs/` | 약 1.2MB 원본 API 응답 묶음, 토큰/쿠키/사용자 필드 흔적 존재 | 제외 |
| `docs/*.txt` | 원본 HTML/요청/응답 로그 성격, 쿠키 또는 서버 원문 포함 가능 | 제외 |
| `docs/knulib_api*.py` | 역공학 참조 코드, 사용자 식별자/비밀번호 파라미터 흔적 존재 | 제외 |
| `docs/capture/` | 화면 캡처, 개인정보 포함 가능성 미검토 | 제외 |
| `docs/prd/`, `docs/reviews/`, `docs/*.md` | 정리된 기획/리뷰/명세 문서 | 선별 포함 가능 |
| `mydocs/` | Hyper-Waterfall 운영 기록 | 포함 |

## `.gitignore` 반영

다음 패턴을 추가했다.

```gitignore
docs/build-*.apk
docs/*.txt
docs/mitlogs/
docs/capture/
docs/knulib_api*.py
```

`.DS_Store`는 기존 전역 패턴으로 이미 제외된다.

## 추적 후보

다음 파일은 Git에 포함해도 되는 정제 문서 후보로 본다.

```text
docs/ai_seat_reservation_spec.md
docs/privacy_policy.md
docs/prd/prd.md
docs/prd/prd_v2.md
docs/reviews/codebase_review.md
docs/reviews/project_status.md
docs/seat_reservation_spec.md
docs/walkthrough/walkthrough_031601.md
docs/학술제/body.md
```

단, `docs/reviews/*`와 `docs/prd/*`는 과거 상태를 담고 있으므로 최신 기준 문서는 `mydocs/report`에 둔다.

## 후속 작업

1. 원본 로그에서 필요한 정보만 추출해 `mydocs/tech/seat_api_spec.md`로 정제한다.
2. 캡처 이미지는 개인정보 포함 여부를 확인한 뒤 필요한 것만 별도 포함한다.
3. APK가 필요하면 GitHub Release artifact 또는 외부 저장소로 관리한다.

