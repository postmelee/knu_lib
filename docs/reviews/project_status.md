# 📚 KNU Library App — 프로젝트 현황 보고서

> 작성일: 2026-03-16 | 버전: v0.2.0 (Seat Domain 완성)

---

## 1. 프로젝트 개요

강남대학교 도서관 앱으로, 학생증 QR 출입, 좌석 예약/관리, 도서 대출 현황을 **단일 네이티브 앱**으로 제공합니다.

| 항목 | 내용 |
|---|---|
| 프레임워크 | React Native + Expo SDK 55 |
| 라우팅 | Expo Router (파일 기반) |
| 상태관리 | @tanstack/react-query v5 |
| HTTP 클라이언트 | Axios |
| 스타일링 | React Native StyleSheet |
| 언어 | TypeScript |

---

## 2. 아키텍처

Strict Layered Architecture를 따릅니다:

```
src/api/types/   → 타입 정의
src/api/         → 순수 HTTP 호출 (Axios)
src/services/    → 비즈니스 로직 (파싱, 상태 결정, 인증 주입)
src/hooks/       → React Query 훅 (Thin Hook)
src/components/  → 프레젠테이션 컴포넌트
src/screens/     → 화면 컴포넌트
app/             → Expo Router 라우트
```

### 도메인별 구현 상태

| 도메인 | Types | API | Service | Hooks | UI | 상태 |
|---|---|---|---|---|---|---|
| Auth | ✅ | ✅ | ✅ | ✅ | ✅ | **완성** |
| User | ✅ | ✅ | ✅ | ✅ | ✅ | **완성** |
| Seat | ✅ | ✅ | ✅ | ✅ | ✅ | **완성** |
| Loan | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | **미완성** |

---

## 3. 라우팅 구조

```
app/
├── _layout.tsx              # AuthGate (인증 분기)
├── login.tsx                # 로그인 화면
├── loan-details.tsx         # 대출 상세 (미완성)
└── (tabs)/
    ├── _layout.tsx          # 탭 네비게이션
    ├── index.tsx            # 홈 대시보드 (QR, 좌석, 대출 요약)
    ├── rooms.tsx            # 열람실 목록
    └── seat-reservation.tsx # 좌석 선택 맵
```

---

## 4. Seat Domain 상세 구현 현황

### 4.1. API 계층 (`src/api/seatApi.ts`)

| 엔드포인트 | 함수명 | 암호화 | 상태 |
|---|---|---|---|
| `GetMyInformation` | `getMyInformation()` | Sponge | ✅ |
| `GetClickerReadingRooms` | `getReadingRooms()` | 없음 | ✅ |
| `UserSeatMobile/{roomId}` | `getReadingRoomSeatsHTML()` | Sponge | ✅ |
| `DoClickerBeaconAction` | `doBeaconAction()` | Sponge | ✅ |
| `ReadingRoomAction` | `reserveSeat()` | Sponge | ✅ |
| `ExtendReadingSeat` | `extendSeat()` | Sponge | ✅ |
| `ReleaseReadingSeat` | `releaseSeat()` | Sponge | ✅ |

### 4.2. 서비스 계층 (`src/services/seatService.ts`)

- `fetchSeatStatus()`: 인증 자동 주입 → `GetMyInformation` 호출 → `UserState` 판별
- `fetchAndParseRoomSeats(roomId)`: 인증 자동 주입 → HTML 파싱 → `ParsedSeat[]` 반환
- `authenticateBeacon()`: 위치 인증
- `requestSeatReservation(seatId, beaconId)`: 좌석 예약
- `requestSeatExtension(seatId, beaconId)`: 좌석 연장
- `requestSeatRelease(seatId)`: 좌석 퇴실

모든 Service 함수는 내부 `getCredentials()` 헬퍼를 통해 `AsyncStorage`에서 인증 정보를 자동 주입합니다.

### 4.3. 상태 머신 (`UserState`)

```
l_communication_status !== "0"  →  UNAUTHORIZED (인증 실패)
l_communication_status === "0"  →  인증 성공:
  ├── seat_id 없음              →  IDLE (빈자리)
  ├── seat_id 있음 + open "1"   →  SEATED (이용 중)
  └── seat_id 있음 + open "0"   →  AWAY (자리비움)
```

> ⚠️ `l_communication_status === "0"`이 **성공**을 의미합니다 (직관과 반대).

### 4.4. 암호화 (`src/utils/crypto.ts`)

`knulib_api.py`의 Sponge 암호화 역공학 구현을 TypeScript로 이식:
- 입력 문자열 역순 변환
- 각 문자마다 랜덤 위치의 패딩 삽입 (짝수: 3자, 홀수: 2자)
- `SPONGE_START` / `SPONGE_STOP` 래핑

### 4.5. 시간 처리 (`src/utils/dateUtils.ts`)

API 시간 형식: `"20260316142740"` (yyyyMMddHHmmss)
- `parseTimeString()`: 14자리 → Date 객체
- `formatHHMM()`: Date → "HH:MM"
- `formatRemaining()`: ms → "H시간 MM분"

---

## 5. 해결된 버그 이력

| 버그 | 원인 | 수정 | 관련 파일 |
|---|---|---|---|
| Session Expired 오류 | `l_communication_status === "0"`을 실패로 판별 | `!== "0"`으로 조건 반전 | `seatService.ts` |
| 서버 인증 거부 | `spongeEncrypt`가 mock(base64) | 실제 알고리즘 이식 | `crypto.ts` |
| 시간/프로그레스바 미표시 | API가 `yyyyMMddHHmmss` 형식인데 ISO로 파싱 | 14자리 직접 파싱 | `dateUtils.ts` |
| Beacon/Reserve API 인증 불일치 | plaintext 전송 | Sponge 암호화 적용 | `seatApi.ts` |
| extend/release에 seatId 누락 | 빈 문자열 전달 | React Query 캐시에서 조회 | `useSeat.ts` |

---

## 6. 남은 작업 (Roadmap)

| 우선순위 | 작업 | 설명 |
|---|---|---|
| 🔴 높음 | Loan Domain 구현 | types → api → service → hook → UI 전체 파이프라인 |
| 🔴 높음 | expo-dev-client 도입 | Beacon BLE 스캔 등 네이티브 기능 대응 |
| 🟡 중간 | 프로그레스바 색상 변화 | 잔여 시간 < 30분 시 경고색 |
| 🟡 중간 | Pull-to-Refresh 연동 강화 | 전체 쿼리 invalidation 확인 |
| 🟢 낮음 | SecureStore 마이그레이션 | AsyncStorage → expo-secure-store |
| 🟢 낮음 | 에러 바운더리 | 전역 에러 핸들링 |
