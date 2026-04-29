---
name: external-pr-review
description: |
  외부 기여자 PR 검토 절차를 적용한다. 명시 호출 시에만 사용한다.
  PR 정보 수집, mydocs/pr/pr_{N}_review.md 작성, 검증, pr_{N}_report.md 작성,
  처리 완료 시 archives/ 이동을 수행한다. 외부 기여자 PR 전용이며 내부 타스크에는 사용하지 않는다.
allow_implicit_invocation: false
---

# 외부 기여자 PR 검토

## 트리거

- 명시 호출만: 작업지시자가 "PR #N 리뷰" 또는 "외부 PR 검토"를 명시 지시한 경우
- 본 SKILL을 직접 호출한 경우

## 사전 조건

- 검토 대상 PR이 외부 기여자 fork에서 본 저장소 `devel` 또는 합의된 base로 열린 상태
- 내부 타스크 PR(`publish/task{N}`)에는 본 SKILL 사용 금지. 내부 타스크는 일반 단계 절차로 검토한다.
- `gh` CLI 인증

## 절차

1. PR 메타 수집
   ```bash
   gh pr view {N} --repo postmelee/knu_lib --json number,title,state,baseRefName,headRefName,headRepository,mergeable,mergeStateStatus,reviewDecision,labels,body
   gh pr diff {N} --repo postmelee/knu_lib
   gh pr checks {N} --repo postmelee/knu_lib
   ```
   - 이슈 연결, base/head, mergeable, CI 상태를 모두 확인한다.
2. 검토 문서 작성: `mydocs/pr/pr_{N}_review.md`
   - 표준 섹션: PR 정보 / 변경 요약 / 영향 범위와 호환성 / 코드·문서 점검 결과 / 검증 계획 / 권고 / 작업지시자 승인 요청
3. 작업지시자 승인 요청: 검토 방향을 먼저 결정한다.
4. 필요 시 수정·검증 계획 문서 작성: `mydocs/pr/pr_{N}_review_impl.md`
   - 본 저장소에서 추가 검증을 직접 수행할 때 사용한다.
   - 작성 후 작업지시자 승인 요청을 받는다.
5. 검증 수행
   - 빌드, 타입 검사, 수동 smoke test 등은 변경 유형에 따라 `mydocs/manual/task_workflow_guide.md`와 `mydocs/manual/git_workflow_guide.md` 정책을 적용한다.
6. 최종 보고서 작성: `mydocs/pr/pr_{N}_report.md`
   - 검토 결과, 검증 결과, 최종 권고, GitHub PR 코멘트 본문 또는 링크를 남긴다.
7. 작업지시자 승인 후 GitHub PR에 코멘트 또는 리뷰 등록
   - merge 결정은 작업지시자가 수행한다.
8. 처리 완료 시 문서 보관 이동
   ```bash
   git mv mydocs/pr/pr_{N}_review.md mydocs/pr/archives/
   git mv mydocs/pr/pr_{N}_review_impl.md mydocs/pr/archives/
   git mv mydocs/pr/pr_{N}_report.md mydocs/pr/archives/
   ```
   - 존재하지 않는 선택 문서는 이동하지 않는다.
9. 단일 또는 단계별 커밋
   ```bash
   git commit -m "PR #{N} 검토: {요약}"
   ```

## 검증

- `mydocs/pr/pr_{N}_review.md` 표준 섹션이 충족되어야 한다.
- 권고 결정이 `merge`, `수정 요청`, `닫기` 중 하나로 명시되어야 한다.
- 처리 완료 후 작성된 검토 문서가 `mydocs/pr/archives/`에 존재해야 한다.

## 절대 하지 말 것

- 내부 타스크 PR(`publish/task{N}`)에 본 SKILL 적용
- 외부 PR을 작업지시자 승인 없이 merge 또는 close
- 외부 기여자 fork의 코드를 본 저장소에 직접 cherry-pick해서 PR 절차 생략
- 내부 단계 절차(`_stage{N}.md`, `_report.md`) 형식을 외부 PR 문서에 강제 적용

## 호출 방법

- Codex: `$external-pr-review` 또는 `/skills` 메뉴
- Claude Code: `/external-pr-review`
