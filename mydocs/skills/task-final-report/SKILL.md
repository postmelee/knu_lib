---
name: task-final-report
description: |
  하이퍼-워터폴 타스크의 최종 보고와 PR 게시 절차를 적용한다. 명시 호출 시에만 사용한다.
  최종 결과 보고서(`_report.md`) 작성, 오늘할일 완료 처리, 최종 커밋,
  publish/task{N} 원격 push, devel 대상 draft PR 생성을 수행한다.
  모든 단계 완료 후 PR 직전에만 호출.
allow_implicit_invocation: false
---

# 하이퍼-워터폴 최종 보고와 PR 게시

## 트리거

- 명시 호출만: 작업지시자가 "최종 보고서 작성", "PR 준비"를 명시 지시한 경우
- 본 SKILL을 직접 호출한 경우

## 사전 조건

- 구현 계획서의 모든 단계 종료, 각 단계 보고서 커밋 완료
- 통합 검증(전체 수용 기준) 통과 확인
- `local/task{N}`에 commit 안 된 변경 없음 또는 본 절차에서 함께 커밋할 것만 남아 있음

## 절차

1. 통합 검증: 구현 계획서의 `수용 기준` 또는 마지막 단계 `검증` 섹션 명령 실행
2. 최종 보고서 작성: `mydocs/report/task_m{milestone}_{N}_report.md`
   - 표준 섹션: 작업 요약 / 변경 파일 목록과 영향 범위 / 변경 전·후 비교 / 검증 결과 / 잔여 위험과 후속 작업 / 작업지시자 승인 요청
3. 오늘할일 갱신: `mydocs/orders/{yyyymmdd}.md`의 `#{N}` 행
   - 상태 `완료`로 변경, 비고에 `완료: HH:mm` 기록
4. 변경 점검
   ```bash
   git status --short
   git diff --check
   git log --oneline devel..local/task{N}
   ```
5. 최종 커밋
   ```bash
   git add mydocs/report/task_m{milestone}_{N}_report.md mydocs/orders/{yyyymmdd}.md
   git commit -m "Task #{N} Stage {마지막} + 최종 보고서: {요약}"
   ```
   - 보고서만 남은 경우: `git commit -m "Task #{N}: 최종 보고서 작성과 오늘할일 완료 처리"`
6. 원격 게시 브랜치 push
   ```bash
   git push origin local/task{N}:publish/task{N}
   ```
7. devel 대상 draft PR 생성
   ```bash
   HEAD_SHA=$(git rev-parse HEAD)
   gh pr create --base devel --head publish/task{N} --draft \
     --title "Task #{N}: {제목}" \
     --body "{최종 보고서 요약, 검증 결과, 문서 링크}"
   ```
   - PR 본문에 최종 보고서 핵심 발췌, 검증 결과, 수용 기준 충족 여부를 포함한다.
   - `문서` 섹션의 모든 문서는 `HEAD_SHA` 기준 `https://github.com/postmelee/knu_lib/blob/{HEAD_SHA}/mydocs/...` URL로 연결한다.
   - 링크 표시는 raw URL이 아니라 `[파일명](URL)` 형식으로 작성한다.
   - 상대 링크(`mydocs/...`)나 `blob/publish/task{N}/...` 링크는 사용하지 않는다.
8. 작업지시자에게 PR URL 전달과 리뷰·merge 승인 요청

## 검증

- 모든 단계 보고서와 최종 보고서가 존재해야 한다.
- `git status --short` 결과가 비어 있어야 한다. unrelated 변경이 있으면 본 절차 대상에서 제외했음을 보고한다.
- `gh pr view` 결과에 draft 상태 PR이 정확한 base/head로 등록되어야 한다.
- PR 본문 `문서` 섹션은 commit SHA 고정 URL과 `[파일명](URL)` 표시 형식을 사용해야 한다.
- PR 본문 `문서` 섹션에 raw GitHub blob URL, 상대 링크, `blob/publish/task{N}` 링크가 없어야 한다.
- 오늘할일 `#{N}` 상태가 `완료`이고 비고에 `완료: HH:mm`이 있어야 한다.

## 절대 하지 말 것

- 통합 검증 실패 상태에서 PR 생성
- `local/task{N}` 브랜치를 원격에 직접 push. 반드시 `publish/task{N}`로 명명한다.
- squash merge 강제 옵션 사용
- 작업지시자 승인 없이 PR을 ready for review 전환 또는 self-merge

## 호출 방법

- Codex: `$task-final-report` 또는 `/skills` 메뉴
- Claude Code: `/task-final-report`
