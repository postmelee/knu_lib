# KNU Library Hyper-Waterfall 운영 규칙

이 문서는 KNU Library 앱에 Hyper-Waterfall 방식을 적용하기 위한 프로젝트 로컬 규칙이다. 원칙은 단순하다. 거시 단계는 문서와 승인으로 통제하고, 미시 단계는 AI와 자동 검증을 사용해 빠르게 반복한다.

## 적용 목적

KNU Library 앱은 React Native/Expo 앱이지만, 단순 모바일 UI 프로젝트가 아니다. Clicker API 역공학, Sponge 암호화, BLE 비콘 인증, HTML 좌석맵 파싱, 대출 HTML 파싱, 네이티브 모듈, 실제 학교 서버 연동이 한 프로젝트 안에 있다.

따라서 새 기능을 바로 구현하기보다 다음 순서를 강제한다.

1. 목표와 범위를 문서화한다.
2. 구현 계획을 작성한다.
3. 코드 변경을 수행한다.
4. 타입 검사, 빌드, 수동 검증 결과를 기록한다.
5. 최종 보고서를 남긴다.

## 디렉토리 구조

```text
mydocs/
├── orders/           # 오늘 할일. yyyymmdd.md 형식.
├── plans/            # 수행 계획서와 구현 계획서.
├── working/          # 단계별 완료 보고서와 최종 결과 보고서.
├── report/           # 프로젝트 현황, 기준선, 릴리즈 보고서.
├── feedback/         # 코드 리뷰 피드백과 후속 조치.
├── tech/             # API, 암호화, 비콘, 파싱 등 기술 문서.
├── manual/           # 운영 규칙과 개발 가이드.
└── troubleshootings/ # 실패 원인, 재현 절차, 해결 기록.
```

기존 `docs/`는 선별한 Markdown 조사 자료와 과거 산출물 보관소로 유지한다. 새 개발 프로세스 기록은 `mydocs/`에 남긴다. 원본 로그, APK, 캡처, 참조 Python은 Git 추적 대상이 아니며 현재 정리 완료 상태다.

## 마일스톤

| 마일스톤 | 이름 | 목적 |
|---|---|---|
| M010 | 현황 기준선 및 문서 체계 | 현재 코드/문서 상태를 고정하고 `mydocs` 운영을 시작한다. |
| M020 | 인증/사용자/QR 안정화 | 로그인, SecureStore 세션, SmartCard, QR 갱신 흐름을 정리한다. |
| M030 | 좌석/비콘 안정화 | 좌석 상태, 예약, 연장, 퇴실, BLE 비콘 인증을 실제 운영 수준으로 만든다. |
| M040 | 대출 도메인 완성 | 대출 목록, 연장 가능 여부, 연장 요청, 상세 화면을 완성한다. |
| M050 | 배포/품질 관문 | Expo dev client, iOS/Android 빌드, 회귀 검증, 개인정보/배포 문서를 정리한다. |

## 타스크 절차

1. GitHub Issue를 만든다. 아직 Issue가 없으면 `mydocs/orders`에는 `생성필요`로 표시한다.
2. `mydocs/plans/task_{issue번호}.md`에 수행 계획서를 작성한다.
3. 필요한 경우 `mydocs/plans/task_{issue번호}_impl.md`에 구현 계획서를 별도로 둔다.
4. 구현 중 의미 있는 단계가 끝나면 `mydocs/working/task_{issue번호}_step{번호}.md`를 작성한다.
5. 완료 시 `mydocs/working/task_{issue번호}_final.md`에 결과, 변경 파일, 검증 결과, 잔여 리스크를 기록한다.
6. `mydocs/orders/yyyymmdd.md`에서 상태를 갱신한다.

## 품질 관문

변경 성격에 따라 다음을 통과 기준으로 삼는다.

| 영역 | 기본 검증 |
|---|---|
| TypeScript | `npx tsc --noEmit` |
| Expo 앱 | `npm run ios`, `npm run android`, 또는 `npm run web` 중 변경 영향에 맞는 실행 |
| API/서비스 | 실제 응답 샘플, 재수집한 로컬 로그, 또는 정제된 Markdown 명세 기반 파싱 검증 |
| UI | 주요 화면 수동 검증, 오류/빈 상태 확인 |
| 네이티브/BLE | iOS/Android 권한, 실제 기기 검증 가능 여부 기록 |

검증을 실행하지 못한 경우에도 통과로 쓰지 않는다. 실행하지 못한 이유와 남은 리스크를 보고서에 남긴다.

## 문서 작성 규칙

- 모든 프로세스 문서는 한국어로 작성한다.
- 원본 로그, APK, 캡처, 참조 Python은 Git에 포함하지 않는다. 필요한 내용만 `docs/` 또는 `mydocs/tech`의 Markdown으로 정제한다.
- 실제 코드 상태와 다른 과거 문서는 "과거 기록"으로 분류하고, 기준선 문서에서 차이를 명시한다.
- 보안상 사용자 인증정보, 세션, 실제 비밀번호, 민감한 서버 응답은 새 문서에 원문으로 복사하지 않는다.

## 참고 자료

- `alhangeul-macos` 공개 문서: https://github.com/postmelee/alhangeul-macos/tree/main/docs
- Hyper-Waterfall 설명 문서: https://github.com/edwardkim/rhwp/blob/main/mydocs/manual/hyper_waterfall.md
