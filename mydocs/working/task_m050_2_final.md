# Task M050 #2 최종 보고서 - Expo dev client 빌드/권한/배포 품질 관문

## 결론

Issue #2의 문서화 범위는 완료했다. 배포 전 품질 관문, 권한 매트릭스, 개인정보/로그 정책, iOS/Android 실행 체크리스트를 `mydocs/tech/release_quality_gate_20260430.md`에 정리했다.

## 변경 사항

| 파일 | 내용 |
|---|---|
| `app.json` | Expo config schema에 맞게 `ios.icon`을 문자열로 보정 |
| `docs/privacy_policy.md` | iOS/Android 권한 이름과 2026-04-30 점검 이력 추가 |
| `mydocs/tech/release_quality_gate_20260430.md` | 배포 품질 관문과 검증 결과 작성 |
| `mydocs/orders/20260430.md` | #2 작업 완료 상태 반영 |

## 검증 결과

| 명령 | 결과 |
|---|---|
| `npm ci --cache /private/tmp/knu_npm_cache --loglevel=warn` | 통과 |
| `npx tsc --noEmit` | 통과 |
| `npx expo config --type public` | 통과 |
| `npx expo-modules-autolinking resolve --platform ios` | 통과, `beacon-ranging` 확인 |
| `npx expo-modules-autolinking resolve --platform android` | 통과, `beacon-ranging` 확인 |
| `npx expo install --check` | 실패, Expo SDK 55 권장 patch mismatch |
| `npx expo-doctor` | 부분 실패, Expo API/RN Directory 네트워크 조회 실패 가능 |

## 남은 리스크

- `npx expo install --check` 기준 Expo/RN patch version mismatch가 남아 있다.
- `npm ci`는 19개 취약점을 보고했다. 릴리즈 전 `npm audit` 세부 검토가 필요하다.
- 이 worktree는 clean checkout이라 `ios/`, `android/` 디렉터리가 없었다. 실제 `npm run ios`, `npm run android` 실행 검증은 prebuild와 기기/시뮬레이터 준비 후 수행해야 한다.
- `expo-doctor`의 네트워크 의존 검사 일부는 `exp.host` 또는 RN Directory 조회 실패로 재현 가능하므로, 네트워크가 안정적인 배포 환경에서 다시 실행해야 한다.

## 다음 단계

1. Expo SDK 55 권장 patch 버전으로 의존성을 업데이트한다.
2. `npm audit` 결과를 분류해 실제 앱 배포 리스크를 판단한다.
3. iOS/Android development build를 생성하고 실제 기기에서 권한/비콘/로그인 흐름을 확인한다.
