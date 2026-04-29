# KNU Library 코드베이스 검토 보고서

> 작성일: 2026-04-29 | 기준: `devel` 계열 + Android native beacon 전환 작업

## 1. 요약

현재 코드베이스는 로그인, SmartCard/QR, 좌석 도메인, 열람실/좌석맵 UI, 대출 목록/상세/연장 흐름을 포함한다.

Loan 연장 API는 `/MyLibrary/Renewal/{bookId}` 호출, mutation hook, 연장 다이얼로그, `BookCard` 분리까지 현재 코드에 반영되어 있다. 남은 작업은 실제 계정/서버에서 성공·실패 메시지와 목록 갱신을 검증하는 것이다.

Beacon은 `modules/beacon-ranging` 로컬 Expo 네이티브 모듈을 iOS/Android 공통 진입점으로 사용한다. iOS는 CoreLocation ranging, Android는 BluetoothLeScanner 기반 Kotlin 모듈에서 iBeacon manufacturer data를 파싱한다.

## 2. 아키텍처 준수 여부

프로젝트는 대체로 다음 레이어 구조를 유지한다.

```text
src/api/types/   -> API/도메인 타입
src/api/         -> Axios 기반 API 호출
src/services/    -> 인증 주입, HTML 파싱, 상태 매핑 등 비즈니스 로직
src/hooks/       -> React Query 훅
src/components/  -> 프레젠테이션 컴포넌트
src/screens/     -> 화면 조합
app/             -> Expo Router 라우트
```

| 영역 | 평가 |
|---|---|
| Auth/User | 서비스와 훅 분리가 양호하다. `fetchUserProfile()` mock은 현재 핵심 흐름에서 사용되지 않는 잔여 코드로 보인다. |
| Seat | API/Service/Hook/UI 레이어가 분리되어 있다. 비콘 인증 ID의 transient state는 실제 서버 회귀 검증이 필요하다. |
| Beacon | iOS/Android가 같은 JS 진입점과 로컬 Expo 네이티브 모듈을 사용한다. Android 실제 기기 검증은 남아 있다. |
| Loan | 목록/상세/연장 API와 UI가 현재 코드에 반영되어 있다. |
| UI | 홈 대시보드, 좌석 상태, 열람실 목록, 좌석맵, 대출 상세 화면이 존재한다. |

## 3. 현재 발견된 이슈

| 우선순위 | 내용 | 파일 |
|---|---|---|
| 높음 | Seat API 암호화 정책이 문서와 코드 사이에 차이가 있어 실제 서버 기준으로 재검증해야 한다. | `docs/seat_reservation_spec.md`, `src/api/seatApi.ts` |
| 높음 | Android 비콘은 native 모듈로 전환되었지만 실제 Android 기기에서 BLE 권한, 위치 서비스, 스캔 결과 수신을 검증해야 한다. | `src/services/beaconService.ts`, `modules/beacon-ranging/` |
| 중간 | Loan 연장 성공·실패 메시지와 목록 invalidation을 실제 계정/서버에서 확인해야 한다. | `src/services/loanService.ts`, `src/hooks/queries/useLoan.ts`, `app/loan-details.tsx` |
| 중간 | `DashboardScreen`과 일부 좌석 예약 화면에 영어 fallback 문구가 남아 있다. | `src/screens/DashboardScreen.tsx` |
| 낮음 | `fetchUserProfile()` mock이 남아 있다. 실제 SmartCard 흐름으로 대체되어 있으면 정리 가능하다. | `src/services/userService.ts` |

## 4. 검증

| 검증 | 결과 |
|---|---|
| TypeScript | `npx tsc --noEmit` 통과 |
| Expo Android autolinking | `npx expo-modules-autolinking resolve --platform android`에서 `beacon-ranging` 확인 |
| Android debug build | `./gradlew :app:assembleDebug` 통과 |
| 원본 docs 정리 | APK/MITM 로그/캡처 삭제, Markdown 문서만 보존 |

## 5. 권장 다음 순서

1. #4: Android 실제 기기에서 비콘 권한, 위치 서비스, Bluetooth powered-on 상태, beacon result 수신을 검증한다.
2. #4: Seat 예약/연장/퇴실 API의 암호화 파라미터와 서버 응답을 실제 계정으로 재검증한다.
3. #5: Loan 연장 성공·실패 메시지와 목록 갱신을 실제 서버에서 회귀 검증한다.
4. #3: Auth/User/QR 회귀 검증과 QR 만료 정책을 확정한다.
