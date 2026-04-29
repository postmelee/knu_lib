# 📚 도서관 앱 프로젝트 PRD v2 (업데이트안)

이 문서는 도서관 앱의 성공적인 개발을 위한 **제품 요구사항 정의서(PRD)** 입니다.
프로젝트 초기 기획(1차안)에서 진행된 실제 개발 내역(Seat Domain 아키텍처 등)과 라우팅 구조 변경 사항을 반영하여 업데이트된 문서입니다.

---

## 1. 프로젝트 목표 (Objective)
- 도서관 출입, 좌석 관리, 도서 대출 등 핵심 기능을 **스크롤을 최소화한 단일 홈 화면(Single Home Screen)**에서 즉각적으로 사용할 수 있도록 제공한다.
- 제일 중요한 기능인 **출입용 QR 코드**는 앱 실행 시 최우선으로 로드되어, 대기 시간 없이 즉시 사용할 수 있어야 한다.

---

## 2. 화면 및 네비게이션 구조 (App Flow)

앱은 `expo-router`의 파일 기반 라우팅 시스템을 따르며 다음과 같이 구성됩니다.

1. **상태 분기 게이트 (`app/_layout.tsx` 중 AuthGate)**: 인증 토큰 존재 여부에 따라 로그인 또는 홈 화면으로 리다이렉션.
2. **로그인 화면 (`app/login.tsx`)**: 최초 진입 시 간단한 학교 포털 로그인 인증 제공.
3. **홈 화면 (`app/(tabs)/index.tsx`)**: 앱의 메인 대시보드. QR, 좌석 현재 상태 요약(`SeatStatusCard`), 요약 대출 현황 노출.
4. **열람실 목록 화면 (`app/(tabs)/rooms.tsx`)**: 홈에서 빈 좌석일 때 [좌석 예약하기] 클릭 시 이동. 전체 열람실의 총/잔여 좌석 조회.
5. **좌석 예약/조회 맵 화면 (`app/(tabs)/seat-reservation.tsx`)**:
   - `roomId`, `roomName`, `requireBeacon`의 파라미터를 수신.
   - Beacon(비콘) 인증 요구 시 백그라운드에서 임시 토큰 취득.
   - HTML 2D Map 파싱 데이터를 기반으로 네이티브 타일 뷰 노출 및 선택 시 최종 예약 수행.
6. **전체 대출 상세 화면 (`app/loan-details.tsx`)**: 전체 대출 목록 및 연장 처리 화면. 현재 브랜치에는 목록/상세 UI가 있고, 연장 API 구현은 `feat/loan-renewal` 브랜치에 완료되어 있어 병합/검증이 필요합니다.

---

## 3. 핵심 요구사항 및 기능 명세 (Core Features)

### 3.1. 인증 및 로그인 (Auth Flow)
- 홈 화면 진입 전, AuthGate를 통해 `AuthSession`을 확인하고 미인증 시 별도 로그인 화면으로 강제 이동한다.
- 로그인 성공 시 사용자 인증 정보(id, pw 등)를 로컬(`SecureStore` 권장, 현재 `AsyncStorage` 활용)에 세션으로 저장한다.

### 3.2. 학생 정보 & 출입 QR 코드 (User Domain)
- **표시 정보**:
  - 이름, 학번, 소속1, 소속2 (`userService.ts` 처리)
  - **동적 QR 코드 이미지** (`react-native-qrcode-svg` 기반)
  - QR 바코드 아래 **생성 시각 정보 노출** (한국어 포맷)
- **주요 기능 (동적 갱신 규칙)**:
  - 특정 시간 흐름 혹은 **당겨서 새로고침(Pull-to-Refresh)** 발생 시, 글로벌 캐시가 파기되면서 백그라운드 API를 호출해 QR ID를 재발급 받는다.

### 3.3. 이용 중인 좌석 현황 관리 (Seat Domain)
- **아키텍처**: 철저한 Clean Architecture 준수
  - `types/seat.ts`: 상태(`UserState`) 및 API, 뷰 모델 타입.
  - `seatApi.ts`: 순수 Axios 네트워크 호출. Sponge 암호화 User-Agent 인터셉터 적용.
  - `seatService.ts`: 비즈니스 로직(Cheerio 응답 파싱, 상태 매핑) 캡슐화 및 `AuthSession` 주입 처리. `l_communication_status === "0"`을 인증 성공으로 판별.
  - `useSeat.ts`: 상태를 프레젠테이셔널 계층에 전달하는 Thin Query Hook들만 배치.
- **표시 정보 (이용 중일 때 - `SeatStatusCard.tsx`)**:
  - 장소 (예: 제1열람실) 및 좌석 번호
  - 남은 시간을 시각적으로 보여주는 **프로그레스 바 (Progress Bar)** 와 타임스탬프 (시작/종료 시각)
- **표시 정보 (이용 중이 아닐 때 - Empty State)**:
  - "이용 중인 좌석이 없습니다" 문구 표출.
  - **[좌석 예약하기]** 버튼 표시 -> 클릭 시 라우팅 (`/(tabs)/rooms`).
- **주요 액션 (기능)**:
  - **퇴실하기 (`useReleaseSeat`)**: 즉각적인 퇴실 API 호출 후 홈 화면 데이터 리프레시(`invalidateQueries`).
  - **연장하기 (`useExtendSeat`)**: 남은 시간 연장 API 호출 후 상태값 변경.

### 3.4. 대출 현황 조회 및 연장 관리 (Loan Domain)
- **표시 정보 (홈 화면 Summary - `LoanSummaryCard.tsx`)**:
  - 총 대출 중인 도서 권수 표기
  - 최대 2~3개의 도서 리스트 표시 (도서명, 반납일자, 남은 기한 D-Day 뱃지)
- **현재 구현 상태**:
  - 현재 브랜치: `/MyLibrary` HTML 파싱 기반 대출 목록, 홈 요약 카드, 전체 대출 상세 화면 구현.
  - `feat/loan-renewal` 브랜치: `/MyLibrary/Renewal/{bookId}` 기반 도서 연장 API, mutation hook, 연장 다이얼로그 구현 완료.
  - 남은 작업: `feat/loan-renewal` 변경 병합/이식 후 현재 브랜치에서 타입 검사와 수동 회귀 검증.
- **주요 기능 아키텍처**: Seat Domain과 동일하게 `types`, `api`, `service`, `hook` 분리 원칙 고수.
- **주요 액션 (기능)**:
  - 홈 화면의 **[도서 연장 신청하기]** 또는 **전체보기** 버튼을 누르면 **도서 전체 목록 화면(`app/loan-details.tsx`)**으로 이동.
  - 리스트 뷰에서 각 항목마다 **[연장하기] 버튼**이 존재. 연장불가 사유가 있으면 비활성화(Disabled).

### 3.5. 글로벌 제어 (UX & State Management)
- 홈 스크린 자체에 `RefreshControl`을 삽입하여, 위에서 아래로 당기는 액션 시 **전체 쿼리 데이터를 Invalidate 처리**하여 갱신한다.
- 데이터 로딩 중에는 React Query의 `isLoading`, `isPending`을 활용해 ActivityIndicator 또는 변경된 텍스트("처리중") 피드백을 사용자에게 명시적으로 제공한다.

---

## 4. 기술 스택 및 개발 규칙
- **프레임워크**: React Native + Expo SDK
- **라우팅**: Expo Router (`app/` 폴더 기반)
- **아키텍처**: Strict Layered Architecture (`src/api/types` → `src/api` → `src/services` → `src/hooks` → `src/components`, `app/` 라우트 연결)
- **데이터 패칭 및 캐싱**: `Axios` + `@tanstack/react-query`
- **뷰 구현 기법**:
  - **Styling**: Standard React Native `StyleSheet` (순수 React Native UI, Tailwind 미사용)
  - **HTML Scraping**: `cheerio` (백엔드 웹뷰 HTML 응답에서 위치 좌표 및 상태 추출하여 네이티브 구동 변환)
  - **암호화**: `src/utils/crypto.ts` — `knulib_api.py` 역공학 기반 실제 Sponge 암호화 알고리즘 구현 완료 (`SPONGE_START/STOP/PAD` 상수 + 역순 문자열 + 랜덤 패딩)

---

## 5. 해결된 버그 이력

| 버그 | 원인 | 수정 내용 | 관련 파일 |
|---|---|---|---|
| Session Expired 오류 | `l_communication_status === "0"`을 UNAUTHORIZED로 잘못 판별 | `!== "0"`으로 조건 반전 | `seatService.ts` |
| 서버 인증 거부 | `spongeEncrypt`가 임시 base64로 구현 | `knulib_api.py` 기반 실제 알고리즘 이식 | `crypto.ts` |
