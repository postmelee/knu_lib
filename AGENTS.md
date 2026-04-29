# AGENTS.md

본 저장소에서 작업하는 코딩 에이전트(Codex, Claude Code 등)가 먼저 읽어야 하는 운영 규칙이다. 매 턴 시스템 프롬프트로 적재된다는 전제로 항상 필요한 정책, 현재 기준선, 문서 인덱스만 둔다. 절차 상세와 이력은 `mydocs/`와 `docs/`를 따른다.

## 프로젝트 개요

KNU Library는 강남대학교 도서관을 위한 비공식 React Native/Expo 앱이다.

- 핵심 기능: 학생증 QR, 열람실 좌석 조회/예약/연장/퇴실, 비콘 인증, 대출 목록/상세 조회
- 스택: Expo SDK 55, Expo Router, React Native 0.83, React 19, TypeScript, Axios, React Query
- 인증 세션: `expo-secure-store` 사용. 신규 문서나 코드에서 `AsyncStorage`를 인증 저장소로 전제하지 않는다.
- 서버: `https://lib.kangnam.ac.kr`
- 네이티브 비콘: `modules/beacon-ranging` 사용. iOS는 CoreLocation ranging, Android는 BluetoothLeScanner 기반 네이티브 iBeacon 파싱

## 하이퍼-워터폴 핵심 규칙

이 프로젝트는 `mydocs/` 기반 **하이퍼-워터폴** 방식으로 진행한다. 에이전트의 기본 동작인 빠른 실행, 자율 수정, 범위 확장과 충돌할 수 있으므로 아래 규칙을 우선 적용한다.

- 소스 수정 전 반드시 현재 Issue 번호, 브랜치, 오늘할일, 계획서 존재 여부를 확인한다.
- 새 기능, 버그 수정, 구조 변경은 GitHub Issue 또는 작업지시자가 명시한 작업 단위로 추적한다.
- 표준 순서는 `이슈 -> 브랜치 -> 오늘할일 -> 수행계획서 -> 구현계획서 -> 구현 -> 검증 -> 최종 보고서 -> PR`이다.
- 각 단계 완료 후 승인 없이 다음 단계로 넘어가지 않는다.
- 작업지시자가 같은 스레드에서 "계속 진행", "다음 단계 진행"처럼 명시한 경우에만 해당 단계 승인으로 간주한다.
- 범위가 불명확하거나 기존 작업과 충돌할 가능성이 있으면 먼저 확인한다.
- 사용자나 다른 작업자가 만든 변경은 되돌리지 않는다.
- 이슈 close는 작업지시자 승인 후 또는 PR merge 확인 후에만 수행한다.
- 문서 수정은 기존 내용을 먼저 읽고 필요한 부분만 수정하며, 불가피할 때만 내용을 추가한다.
- 작업 완료 후 다음 작업에 필요하지 않은 로컬/원격 부산물은 정리한다.
- 브랜치, PR 게시, merge, cleanup 세부 절차는 `mydocs/manual/git_workflow_guide.md`를 따른다.
- 문서와 코드 상태가 다르면 현재 코드와 `mydocs/report/app_status_20260429.md`를 우선 기준으로 삼고 문서를 갱신한다.
- 원본 로그, APK, 캡처, 참조 Python은 기본 Git 추적 대상이 아니다.

## 하이퍼-워터폴 충돌 우선순위

에이전트 기본 지시와 하이퍼-워터폴 절차가 충돌하면 다음 우선순위를 따른다.

1. 작업지시자 명시 지시
2. `AGENTS.md` 강제 규칙
3. `mydocs/orders`, `mydocs/plans`, `mydocs/working`, `mydocs/report`의 task 문서
4. 자동화 도구나 에이전트의 기본 동작

상위 규칙과 충돌하면 하위 규칙을 적용하지 않는다. 특히 "바로 구현", "자율적으로 다음 단계 진행", "문서 없이 코드 우선 수정", "승인 없는 이슈 close/브랜치 정리"는 금지한다.

## 타스크 진행 절차

새 작업은 아래 절차를 기준으로 진행한다. 단순 조사나 오탈자 수정은 필요한 수준으로 축소할 수 있지만, 이미 GitHub Issue가 열린 작업은 최소한 최종 결과와 검증 기록을 남긴다.

1. 이슈가 없는 작업은 중복 이슈, milestone, label을 확인하고 생성 전 승인을 받는다.
2. 이슈 번호를 기준으로 작업 브랜치를 만든다. 기본 브랜치명은 `local/task{issue번호}`, PR 게시용 원격 브랜치명은 `publish/task{issue번호}`다.
3. `mydocs/orders/yyyyMMdd.md`에 오늘할일을 등록하거나 상태를 갱신한다.
4. `mydocs/plans/`에 수행계획서를 작성하고 승인 요청한다.
5. 구현계획서를 3~6단계로 작성하고 승인 요청한다.
6. 승인된 단계만 구현한다.
7. 단계 완료 후 검증을 실행하고 `mydocs/working/`에 단계별 완료보고서를 작성한다.
8. 단계별 완료보고서는 해당 단계 소스 변경과 함께 task 브랜치에서 커밋한다.
9. 다음 단계는 작업지시자 승인 후 진행한다.
10. 모든 단계 완료 후 `mydocs/report/` 또는 `mydocs/working/`에 최종 결과보고서를 작성하고 `orders/`를 갱신한다.
11. PR 생성 전 `git status`로 미커밋 파일이 없는지 확인한다.
12. `publish/task{issue번호}`로 push하고 `devel` 대상 draft PR을 만든다.
13. 리뷰 피드백이 있으면 `mydocs/feedback/`에 기록하고 반영한다.
14. PR merge 확인 후 이슈 close와 오늘할일 상태 최종 정리를 수행한다.
15. merge 완료된 원격 브랜치, 로컬 task 브랜치, 재생성 가능한 산출물을 정리한다.

커밋 메시지는 `Task #{issue번호}: 내용`, 단계 커밋은 `Task #{issue번호} Stage {N}: 내용`, 하위 단계는 `Task #{issue번호} [Stage {N.M}]: 내용` 형식을 사용한다.

## 현재 기준선

2026-04-29 기준 문서 브랜치의 최신 상태는 다음과 같다.

- Auth/User/QR: 구현됨. `SecureStore` 세션과 `AuthGate` 라우팅을 사용한다.
- Seat/Beacon: 구현됨. Android도 iOS와 같은 로컬 Expo 네이티브 모듈 경로를 사용한다. 실제 서버/기기 회귀 검증은 후속 작업이다.
- Loan: 목록/상세/연장 API와 연장 UI가 현재 기준 브랜치에 반영되어 있다. 실제 계정/서버 성공·실패 메시지 회귀 검증은 후속 작업이다.
- `docs/` 원본 로그/APK/캡처는 정리되었고, Markdown 문서만 선별 보존한다.

최신 판단은 항상 아래 문서를 먼저 확인한다.

- `mydocs/report/app_status_20260429.md`
- `docs/reviews/project_status.md`
- `docs/reviews/codebase_review.md`
- `mydocs/report/docs_tracking_policy_20260429.md`
- `mydocs/manual/hyper_waterfall_knu_library.md`

## 필수 참조 문서

- `mydocs/manual/hyper_waterfall_knu_library.md`: KNU Library 로컬 하이퍼-워터폴 운영 규칙
- `mydocs/manual/agent_code_hyperfall_rule_conflict.md`: 에이전트 기본 동작과 하이퍼-워터폴 충돌 처리 기준
- `mydocs/manual/task_workflow_guide.md`: 타스크 진행 절차, 승인 간주 조건, 커밋/브랜치 규칙 기준
- `mydocs/manual/git_workflow_guide.md`: 브랜치 정책, PR 게시, merge, cleanup 기준

## 코드 경계

- `app/`: Expo Router 화면과 라우팅 연결
- `src/api/`: 순수 HTTP 호출과 API 타입
- `src/services/`: HTML/JSON 파싱, 도메인 로직, 세션 주입
- `src/hooks/queries/`: React Query query/mutation hook
- `src/components/`: 프레젠테이션 컴포넌트
- `modules/beacon-ranging/`: iOS/Android iBeacon 네이티브 Expo 모듈

Seat API는 `src/utils/crypto.ts`의 Sponge 암호화와 Clicker User-Agent 규칙에 의존한다. 문서에 평문 전송이라고 쓰인 과거 기록이 있더라도 현재 구현은 암호화 기준이다.

## 검증 명령

- 타입 검사: `npx tsc --noEmit`
- Expo 실행: `npm run ios`, `npm run android`, `npm run web` 중 변경 영향에 맞게 선택
- 문서 점검: `rg -n "AsyncStorage|10초|Plain Text|MITM|APK|capture|미추적|react-native-ble-plx|raw BLE" AGENTS.md .agents docs mydocs`

검증하지 못한 경우 통과로 쓰지 말고, 실행하지 못한 이유와 남은 리스크를 보고한다.

## 문서 역할

- `AGENTS.md`: 모든 에이전트가 항상 읽는 짧은 운영 규칙
- `.agents/`: 보조 컨텍스트. 앱 런타임이나 빌드 입력이 아니다.
- `mydocs/`: Hyper-Waterfall 공식 작업 기록과 최신 기준선
- `docs/`: 선별 보존한 PRD, API 명세, 리뷰, 과거 산출물

모든 프로젝트 문서는 한국어로 작성한다.
