# AGENTS.md

본 저장소에서 작업하는 코딩 에이전트(Codex, Claude Code 등)가 먼저 읽어야 하는 운영 규칙이다. 항상 필요한 정책, 현재 기준선, 문서 인덱스만 둔다. 절차 상세와 이력은 `mydocs/`와 `docs/`를 따른다.

## 프로젝트 개요

KNU Library는 강남대학교 도서관을 위한 비공식 React Native/Expo 앱이다.

- 핵심 기능: 학생증 QR, 열람실 좌석 조회/예약/연장/퇴실, 비콘 인증, 대출 목록/상세 조회
- 스택: Expo SDK 55, Expo Router, React Native 0.83, React 19, TypeScript, Axios, React Query
- 인증 세션: `expo-secure-store` 사용. 신규 문서나 코드에서 `AsyncStorage`를 인증 저장소로 전제하지 않는다.
- 서버: `https://lib.kangnam.ac.kr`
- 네이티브 비콘: iOS는 `modules/beacon-ranging` CoreLocation ranging, Android는 `react-native-ble-plx` raw BLE scan

## 하이퍼-워터폴 규칙

이 프로젝트는 `mydocs/` 기반 Hyper-Waterfall 방식으로 진행한다.

- 새 기능, 버그 수정, 구조 변경은 Issue 또는 명시된 작업 단위로 추적한다.
- 구현 전 `mydocs/plans/`, 진행 중 `mydocs/working/`, 완료 후 `mydocs/report/` 또는 최종 보고서에 기록한다.
- 사용자가 같은 스레드에서 "진행", "다음 작업", "계속"처럼 명시한 경우 해당 단계 진행 승인으로 간주한다.
- 사용자나 다른 작업자가 만든 변경은 되돌리지 않는다.
- 문서와 코드 상태가 다르면 현재 코드와 `mydocs/report/app_status_20260429.md`를 우선 기준으로 삼고 문서를 갱신한다.
- 원본 로그, APK, 캡처, 참조 Python은 기본 Git 추적 대상이 아니다.

## 현재 기준선

2026-04-29 기준 문서 브랜치의 최신 상태는 다음과 같다.

- Auth/User/QR: 구현됨. `SecureStore` 세션과 `AuthGate` 라우팅을 사용한다.
- Seat/Beacon: 구현됨. 실제 서버/기기 회귀 검증은 후속 작업이다.
- Loan: 현재 기준 브랜치에는 목록/상세/연장 버튼 UI가 있으며 실제 도서 연장 호출은 비어 있다. `feat/loan-renewal`에는 `/MyLibrary/Renewal/{bookId}` 기반 구현이 완료되어 있으므로 병합/이식이 남아 있다.
- `docs/` 원본 로그/APK/캡처는 정리되었고, Markdown 문서만 선별 보존한다.

최신 판단은 항상 아래 문서를 먼저 확인한다.

- `mydocs/report/app_status_20260429.md`
- `docs/reviews/project_status.md`
- `docs/reviews/codebase_review.md`
- `mydocs/report/docs_tracking_policy_20260429.md`

## 코드 경계

- `app/`: Expo Router 화면과 라우팅 연결
- `src/api/`: 순수 HTTP 호출과 API 타입
- `src/services/`: HTML/JSON 파싱, 도메인 로직, 세션 주입
- `src/hooks/queries/`: React Query query/mutation hook
- `src/components/`: 프레젠테이션 컴포넌트
- `modules/beacon-ranging/`: iOS CoreLocation 비콘 네이티브 모듈

Seat API는 `src/utils/crypto.ts`의 Sponge 암호화와 Clicker User-Agent 규칙에 의존한다. 문서에 평문 전송이라고 쓰인 과거 기록이 있더라도 현재 구현은 암호화 기준이다.

## 검증 명령

- 타입 검사: `npx tsc --noEmit`
- Expo 실행: `npm run ios`, `npm run android`, `npm run web` 중 변경 영향에 맞게 선택
- 문서 점검: `rg -n "AsyncStorage|10초|Plain Text|MITM|APK|capture|미추적" AGENTS.md .agents docs mydocs`

검증하지 못한 경우 통과로 쓰지 말고, 실행하지 못한 이유와 남은 리스크를 보고한다.

## 문서 역할

- `AGENTS.md`: 모든 에이전트가 항상 읽는 짧은 운영 규칙
- `.agents/`: 보조 컨텍스트. 앱 런타임이나 빌드 입력이 아니다.
- `mydocs/`: Hyper-Waterfall 공식 작업 기록과 최신 기준선
- `docs/`: 선별 보존한 PRD, API 명세, 리뷰, 과거 산출물

모든 프로젝트 문서는 한국어로 작성한다.
