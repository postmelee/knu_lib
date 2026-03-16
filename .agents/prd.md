# 📚 도서관 앱 프로젝트 PRD (최종안)

이 문서는 도서관 앱의 성공적인 개발을 위한 **제품 요구사항 정의서(PRD)** 입니다. 
본 문서는 프로젝트 진행에 있어 최우선으로 참고해야 할 **절대적인 개발 규칙 및 화면 명세서**로 작동합니다.

---

## 1. 프로젝트 목표 (Objective)
- 도서관 출입, 좌석 관리, 도서 대출 등 핵심 기능을 **스크롤을 최소화한 단일 홈 화면(Single Home Screen)**에서 즉각적으로 사용할 수 있도록 제공한다.
- 제일 중요한 기능인 **출입용 QR 코드**는 앱 실행 시 최우선으로 로드되어, 대기 시간 없이 즉시 사용할 수 있어야 한다.

---

## 2. 화면 및 네비게이션 구조 (App Flow)

앱은 단순하고 직관적인 플로우를 가집니다. (Expo Router 기준 파일 맵핑)

1. **로그인 화면 (`app/login.tsx`)**: 최초 진입 시 학번/비밀번호 기반 인증.
2. **홈 화면 (`app/(tabs)/index.tsx`)**: 앱의 메인 대시보드. QR, 좌석 조회, 요약 대출 현황 노출.
3. **좌석 예약/조회 화면 (`app/seat-reservation.tsx`)**: 빈 좌석일 때 예약으로 넘어가는 뷰.
4. **전체 대출 상세 화면 (`app/loan-details.tsx`)**: 전체 대출 목록 및 연장 처리 화면.

---

## 3. 핵심 요구사항 및 기능 명세 (Core Features)

### 3.1. 인증 및 로그인 (Auth Flow)
- 홈 화면 진입 전, **별도 로그인 화면**(`app/login.tsx`)이 존재한다.
- 학번과 비밀번호를 입력하여 도서관 API(`/Account/RequestClickerSmartCardInformation`)로 인증한다.
- 학번은 전송 시 **10자리 zero-padding** 처리된다 (예: `202002502` → `0202002502`).
- 로그인 성공 시 응답(`SmartCard`)과 인증 정보를 `AsyncStorage`에 저장하고 홈 화면으로 라우팅한다.
- `app/_layout.tsx`의 `AuthGate` 컴포넌트가 세션 존재 여부에 따라 자동으로 login/home 라우팅을 제어한다.

### 3.2. 학생 정보 & 출입 QR 코드 (우선순위 1)
- **표시 정보**:
  - 이름, 학번, 소속1(학부/학과), 소속2(단과대학)
  - **동적 QR 코드 이미지** (기기 시간 또는 서버 시간 기반)
  - QR 바코드 아래 **생성 시각 정보 노출** (예: 2026년 03월 12일 오전 09시 20분 17초)
- **주요 기능 (동적 갱신 규칙)**: 
  - 특정 시간 만료 시 QR 코드는 비활성화되며, 전체 화면의 **당겨서 새로고침(Pull-to-Refresh)** 액션을 통해 새로운 서버 시각과 QR 코드를 재발급 받는다.

### 3.3. 이용 중인 좌석 현황 관리
- **표시 정보 (이용 중일 때)**:
  - 장소 / 카테고리 (예: 제1열람실)
  - 좌석 번호
  - 현재 상태 뱃지와 시작 시각 / 종료 시각
  - 남은 시간을 시각적으로 보여주는 **프로그레스 바 (Progress Bar)** 와 타임스탬프 (예: 01:42:10)
- **표시 정보 (이용 중이 아닐 때 Empty State)**:
  - "이용 중인 좌석이 없습니다" 문구 표출.
  - **[좌석 예약하기]** 버튼 표시. (클릭 시 별도의 예약 화면(`feat/seat-reservation`)으로 넘어가도록 구현)
- **주요 액션 (기능)**:
  - **퇴실하기**: 즉각적인 퇴실 API 호출 후 홈 화면 데이터 리프레시.
  - **연장하기**: 남은 시간 연장 API 호출 후 상태값 변경.

### 3.4. 대출 현황 조회 및 연장 관리
- **표시 정보 (홈 화면 Summary)**:
  - 총 대출 중인 도서 권수 표기
  - 최대 2~3개의 도서 리스트를 배열로 표시 (도서명, 반납일자, 남은 기한 D-Day 뱃지)
- **주요 액션 (기능)**:
  - 홈 화면의 **[도서 연장 신청하기]** 또는 **[전체보기 >]** 버튼을 누르면 **도서 전체 목록 화면**으로 이동한다.
  - 리스트 뷰에서 각 항목 우측(또는 하단)에 물리적인 **[연장하기] 버튼**이 존재하여, 해당 책을 선택적으로 연장할 수 있도록 UX를 통일한다.
  - 연장불가 사유(연체 등)가 있는 아이템은 버튼을 비활성화(Disabled) 처리한다.

### 3.5. 글로벌 제어 (UX)
- 홈 스크린 자체에 `RefreshControl`을 삽입하여, 위에서 아래로 당기는 스와이프 액션 발생 시 **모든 서버 데이터(QR 갱신, 좌석 현황 갱신, 도서 현황 갱신)**를 리패칭(Reloard)한다. React Query의 `refetch` 메서드를 적극 활용한다.

---

## 4. 기술 스택 및 아키텍처 규칙
- **프레임워크**: React Native + Expo SDK
- **라우팅**: Expo Router (`app/` 폴더 기반)
- **아키텍처**: Layered Architecture (`src/api`, `src/services`, `src/hooks`, `src/components`)
- **데이터 패칭 및 캐싱**: `Axios` + `@tanstack/react-query`
- **로컬 저장소**: `@react-native-async-storage/async-storage` (인증 세션 저장)
- **Styling**: Standard React Native `StyleSheet` will be used for writing layout and UI styles, ensuring zero dependency overhead and robust performance.

---

## 5. API 명세 (Server Endpoints)

- **Base URL**: `https://lib.kangnam.ac.kr`
- **Accept Header**: `application/json`

| API | Method | Path | Query Params | Response |
|---|---|---|---|---|
| 사용자 인증 (SmartCard) | GET | `/Account/RequestClickerSmartCardInformation` | `l_user_id` (10자리 패딩), `l_user_pass` | `SmartCard` JSON |
| 대출 도서 조회 | GET | `/MyLibrary` | `q=1`, `Userid` (10자리 패딩), `Userpass` | HTML (파싱 필요) |

---

## 6. 데이터 모델 (Type Definitions)

### SmartCard (서버 응답)
```typescript
interface SmartCardResponse {
  libtechAccountName: string;      // 이름
  libtechAccountUserid: string;    // 학번
  libtechAccountUseridQr: string;  // QR 식별자
  libtechAccountDepart: string;    // 학부/학과
  libtechAccountUniv: string;      // 단과대학
}
```

### User (앱 내부 모델)
```typescript
interface User {
  id: string;
  name: string;
  studentId: string;     // 학번
  department: string;    // 소속1 (학부/학과)
  college: string;       // 소속2 (단과대학)
  qrId?: string;         // QR 식별자
}
```

### Book (대출 도서)
```typescript
interface Book {
  num: string;           // 번호
  name: string;          // 도서명
  rentalDate: string;    // 대출 일자
  dueDate: string;       // 반납 예정일
  returnedDate: string;  // 반납 일자
  returnedStatus: string; // 반납 상태
  renewable: string;     // 연장 가능 여부
  renewCount: string;    // 연장 횟수
}
```

*(End of Document)*
