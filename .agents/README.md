# .agents

`.agents/`는 코딩 에이전트가 참고할 보조 컨텍스트를 담는 디렉토리다. 앱 런타임, Expo 빌드, 테스트 실행에는 사용되지 않는다.

루트 `AGENTS.md`가 항상 우선이다. 이 디렉토리의 문서가 `AGENTS.md`, 현재 코드, `mydocs/report/app_status_20260429.md`와 충돌하면 최신 기준 문서를 우선하고 이 파일들을 갱신한다.

## 파일

| 파일 | 용도 |
|---|---|
| `prd.md` | 현재 코드 기준으로 압축한 제품/기능 요구사항 |
| `beacon_analysis.md` | 비콘 인증 흐름과 현재 iOS/Android 구현 기준 |

## 유지 규칙

- 인증 저장소는 `SecureStore` 기준으로 쓴다.
- 비콘 타임아웃은 현재 코드의 `SCAN_TIMEOUT_MS = 20_000` 기준으로 쓴다.
- Seat API 자격 증명은 Sponge 암호화 기준으로 쓴다.
- Loan 연장 API 상태는 `feat/loan-renewal` 병합 여부를 분리해서 기록한다.
