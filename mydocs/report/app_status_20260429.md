# KNU Library 앱 상태 보고 - 2026-04-29

## 결론

현재 `devel` 계열 기준 앱은 Auth, User/QR, Seat, Beacon, Loan 목록/상세/연장 흐름까지 구현되어 있다.

Loan 연장 API는 `/MyLibrary/Renewal/{bookId}` 호출, React Query mutation, 연장 다이얼로그, `BookCard` 분리까지 현재 코드에 반영되어 있다. 남은 작업은 실제 계정/서버에서 성공·실패 메시지와 목록 갱신을 확인하는 것이다.

Beacon은 iOS와 Android 모두 `modules/beacon-ranging` 로컬 Expo 네이티브 모듈을 통해 동작한다. iOS는 CoreLocation ranging, Android는 BluetoothLeScanner 기반 Kotlin 모듈에서 iBeacon manufacturer data를 파싱한다. Android 실기기 테스트는 2026-04-30 완료 보고되었다.

## 검증

| 항목 | 결과 |
|---|---|
| 현재 작업 브랜치 | `local/task4` |
| TypeScript 검사 | `npx tsc --noEmit` 통과 |
| Android module autolinking | `npx expo-modules-autolinking resolve --platform android`에서 `beacon-ranging` 확인 |
| Android debug build | `./gradlew :app:assembleDebug` 통과 |

## 도메인별 상태

| 도메인 | 현재 코드 상태 | 다음 작업 |
|---|---|---|
| Auth | 구현됨. `GetMyinformation?login=true` 검증, SmartCard 조회, SecureStore 세션 저장, AuthGate 라우팅이 있다. | 실제 계정 로그인 회귀 검증 |
| User/QR | 구현됨. SmartCard 기반 사용자 정보와 QR 렌더링, QR ID 경량 갱신이 있다. | QR 만료 정책과 Pull-to-refresh 동작 문서화 |
| Seat | 구현됨. 상태 조회, 열람실 목록, 좌석맵 파싱, 예약, 좌석 연장, 퇴실 훅/UI가 있다. | API 암호화 정책과 실제 서버/기기 회귀 검증 |
| Beacon | 구현됨. iOS CoreLocation native ranging과 Android BluetoothLeScanner native parsing 경로가 있다. Android 실기기 테스트 완료 보고됨. | Play Console 비공개 테스트 반영 모니터링 |
| Loan | 구현됨. 목록/상세/연장 API, mutation hook, 연장 다이얼로그와 목록 invalidation이 있다. | 실제 서버 성공·실패 메시지 검증 |
| Release/Docs | Hyper-Waterfall 문서 체계와 선별 docs 보존 완료. 배포 품질 관문은 `mydocs/tech/release_quality_gate_20260430.md`에 정리했다. | Expo SDK patch mismatch, npm audit, iOS/Android 실제 실행 검증 |

## Loan 연장 구현

현재 코드에는 다음 구현이 존재한다.

| 파일 | 변경 내용 |
|---|---|
| `src/services/loanService.ts` | `extendRentalBook(bookId)`, `/MyLibrary/Renewal/{bookId}` POST 호출, 성공/실패 HTML 파싱 |
| `src/hooks/queries/useLoan.ts` | `useRenewBookMutation()`, `useExtendDialog()`, 성공 시 Loan query invalidation |
| `src/api/types/book.ts` | 연장 대상 식별용 `id` 필드 |
| `src/components/BookCard.tsx` | 대출 도서 카드 분리, 연장 버튼 처리 |
| `app/loan-details.tsx` | `BookCard`와 `useExtendDialog()` 연결 |

## Android 비콘 전환

Android 비콘 인증은 기존 외부 BLE 라이브러리 경로에서 iOS와 유사한 로컬 Expo native module 경로로 전환했다.

| 항목 | 현재 구현 |
|---|---|
| JS 진입점 | `src/services/beaconService.ts`의 `scanWithNativeRanging()` |
| Native module | `modules/beacon-ranging/android/src/main/java/expo/modules/beaconranging/BeaconRangingModule.kt` |
| 스캔 API | `BluetoothLeScanner.startScan()` |
| 파싱 | Kotlin에서 iBeacon UUID, major, minor 추출 |
| 권한 | Android 12 이상 `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `ACCESS_FINE_LOCATION`; Android 11 이하 `ACCESS_FINE_LOCATION` |
| 남은 검증 | 실제 Android 기기에서 BLE 권한, 위치 서비스, Bluetooth 상태, 실제 비콘 수신 확인 |

## 문서 반영 사항

- `AGENTS.md`: iOS/Android native beacon 기준과 Loan 구현 상태 최신화
- `.agents/prd.md`, `.agents/beacon_analysis.md`: beacon/Loan 상태 최신화
- `docs/reviews/project_status.md`, `docs/reviews/codebase_review.md`: 최신 코드 기준으로 교체
- `mydocs/report/current_state_baseline_20260429.md`: 현재 기준선 재정리
