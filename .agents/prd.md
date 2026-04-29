# KNU Library PRD - Agent Context

이 문서는 코딩 에이전트가 빠르게 프로젝트 맥락을 파악하기 위한 보조 PRD다. 최신 운영 기준은 루트 `AGENTS.md`와 `mydocs/report/app_status_20260429.md`를 우선한다.

## 1. 목표

강남대학교 도서관의 핵심 사용 흐름을 하나의 네이티브 앱에서 제공한다.

- 학생증 QR 출입
- 열람실 좌석 조회, 예약, 연장, 퇴실
- 도서 대출 목록과 반납 예정일 확인
- 도서 연장 신청

## 2. 화면 구조

| 화면 | 파일 | 상태 |
|---|---|---|
| 인증 게이트 | `app/_layout.tsx` | 구현됨 |
| 로그인 | `app/login.tsx` | 구현됨 |
| 홈 대시보드 | `app/(tabs)/index.tsx` | 구현됨 |
| 열람실 목록 | `app/(tabs)/rooms.tsx` | 구현됨 |
| 좌석 예약/조회 | `app/(tabs)/seat-reservation.tsx` | 구현됨 |
| 대출 상세 | `app/loan-details.tsx` | 목록/상세 UI와 도서 연장 호출 구현됨 |

## 3. 도메인 요구사항

### Auth/User/QR

- 로그인은 `GetMyinformation?login=true`로 유효성을 확인한 뒤 SmartCard API를 호출한다.
- 학번은 필요 시 10자리로 zero-padding한다.
- 세션은 `expo-secure-store`에 저장한다.
- `AuthGate`가 저장 세션 존재 여부에 따라 로그인/홈 라우팅을 제어한다.
- QR ID는 SmartCard 기반으로 표시하고, 새로고침 시 QR ID만 갱신할 수 있다.

### Seat/Beacon

- Seat Domain은 `src/api/types -> src/api -> src/services -> src/hooks/queries -> src/components` 흐름을 따른다.
- `src/api/seatApi.ts`는 Clicker API 호출을 담당하고 Sponge 암호화 User-Agent 규칙을 사용한다.
- 좌석 상태, 열람실 목록, 좌석맵 HTML 파싱, 예약, 좌석 연장, 퇴실 흐름이 구현되어 있다.
- 비콘은 `modules/beacon-ranging` 로컬 Expo 네이티브 모듈을 사용한다.
- iOS는 CoreLocation ranging, Android는 BluetoothLeScanner 기반 네이티브 iBeacon 파싱을 사용한다.
- 현재 코드의 비콘 스캔 타임아웃은 20초다.
- 실제 도서관 비콘/서버 회귀 검증은 후속 작업으로 남아 있다.

### Loan

- `/MyLibrary` HTML 파싱, 홈 `LoanSummaryCard`, `app/loan-details.tsx` 목록/상세 UI가 구현되어 있다.
- `/MyLibrary/Renewal/{bookId}` 기반 연장 API, mutation hook, 연장 다이얼로그, `BookCard` 분리가 현재 코드에 반영되어 있다.
- Loan을 운영 완료로 판단하려면 실제 계정/서버에서 성공·실패 메시지 회귀 검증이 필요하다.

## 4. 기술 스택

- Expo SDK 55
- Expo Router
- React Native 0.83
- React 19
- TypeScript
- Axios
- `@tanstack/react-query`
- `expo-secure-store`
- `react-native-qrcode-svg`
- `cheerio`

## 5. 데이터 모델 요약

```typescript
interface SmartCard {
  name: string;
  id: string;
  qrId: string;
  department: string;
  college: string;
  guid?: string;
}

interface Book {
  num: string;
  name: string;
  rentalDate: string;
  dueDate: string;
  returnedDate: string;
  returnedStatus: string;
  renewable: string;
  renewCount: string;
}
```

도서 연장 대상 식별을 위해 `Book.id`를 사용한다.

## 6. 우선순위

1. Seat API 암호화/파라미터 정책과 실제 서버 응답 재검증
2. iOS/Android 실제 기기 비콘 회귀 검증
3. Loan 연장 성공·실패 메시지 실제 서버 회귀 검증
4. Auth/User/QR 갱신 정책 문서화와 회귀 검증
5. Expo dev client, 권한, 개인정보/배포 문서 정리
