# CHANGELOG

All notable changes to KNU Library app are documented here.
Base: `d3ba4bb` (HEAD -> master, origin/master) — Merge branch 'chore/major-changes'

---

## [Unreleased]

### Branch: feat/loan-renewal

#### feat: 도서 연장 기능 구현 (클라이언트 검증 로직)
- `src/hooks/queries/useLoan.ts`
  - `useRenewBookMutation`: useMutation 기반 연장 API 요청 훅 추가
  - `useExtendDialog`: 연장 전 클라이언트 검증 및 Alert 흐름 담당 훅 추가
    - 당일 대출 도서 연장 차단 → "당일 대출한 도서는 연장이 불가능합니다." Alert
    - D-Day > 7일 이상 남은 경우 차단 → "대출연장은 반납 1주일 전 (YYYY.MM.DD) 부터 가능합니다." Alert
    - 조건 통과 시 연장 신청 확인 Alert → "연기 신청 시, 반납예정일은 {date}로 연기됩니다. {title} 도서를 연기할까요?" 팝업
  - 연장 성공 시 `invalidateQueries(LOAN_KEY)`로 목록 자동 갱신

#### feat: 도서 연장 API 서비스 구현
- `src/services/loanService.ts`
  - `extendRentalBook(bookId)`: POST /MyLibrary/Renewal/{bookId} 구현
  - Request: Content-Type: application/x-www-form-urlencoded, Body: `confirmButton1=`
  - Referer 헤더 동적 주입
  - 응답 파싱 정확화:
    - 성공: body에 `/Mylibrary` 또는 `Object moved` 포함 → return true
    - 실패: body의 `.panel-body strong` 텍스트 추출 → 서버 에러 메시지를 그대로 throw
  - `parseBooks()` 내 도서 ID 파싱 추가: `cells.eq(0).find('label').attr('for')`

#### feat: 대출 목록 화면 리팩토링
- `app/loan-details.tsx`
  - 기존 인라인 비즈니스 로직 제거
  - `useExtendDialog` 훅으로 연장 로직 위임
  - `BookCard` 컴포넌트로 개별 도서 렌더링 위임

#### chore: 도서 타입 업데이트
- `src/api/types/book.ts`
  - `Book` 인터페이스에 `id: string` 필드 추가 (연장 API 호출에 사용)

---

### Branch: feat/app-icons

#### feat: iOS 적응형 아이콘 및 스플래시 업데이트
- `app.json`
  - `ios.icon`: light/dark/tinted 세 가지 적응형 아이콘 설정 (iOS 18 Adaptive Icon)
    - light: `Icon-iOS-Default-1024x1024@1x.png`
    - dark: `Icon-iOS-Dark-1024x1024@1x.png`
    - tinted: `Icon-iOS-Default-1024x1024@1x.png`
  - `android.adaptiveIcon`: foreground/monochrome 이미지 교체
  - `splash.imageWidth: 200` 추가 (스플래시 이미지 크기 조절 시도)
  - `ios.infoPlist`: 블루투스/위치 권한 설명 문자열 설정
  - `updates`, `runtimeVersion`, `extra.eas` 설정 추가
- `eas.json`
  - `preview` 프로필 추가 (iOS 내부 배포용 Provisioning Profile)
  - `production` 프로필 업데이트

#### chore: 아이콘 에셋 교체
- `assets/Icon-iOS-Default-1024x1024@1x.png` (신규)
- `assets/Icon-iOS-Dark-1024x1024@1x.png` (신규)
- `assets/Icon-iOS-ClearLight-1024x1024@1x.png` (신규)
- `assets/Icon-iOS-ClearDark-1024x1024@1x.png` (신규)
- `assets/Icon-iOS-TintedDark-1024x1024@1x.png` (신규)
- `assets/Icon-iOS-TintedLight-1024x1024@1x.png` (신규)
- `assets/android-icon-foreground.png` (교체)
- `assets/android-icon-monochrome.png` (교체)
- `assets/splash-icon.png` (교체)
- `assets/icon.png` (삭제 — iOS/Android 별도 아이콘으로 대체)
- `assets/android-icon-background.png` (삭제 — backgroundColor로 대체)

---

### Branch: refactor/ui-cleanup

#### refactor: BookCard 컴포넌트 분리
- `src/components/BookCard.tsx` (신규)
  - `loan-details.tsx`에 인라인으로 존재하던 도서 카드 렌더링 로직을 독립 컴포넌트로 분리
  - props: `{ item: BookWithDDay, onExtend: (book) => void }`
  - 연체/반납 상태에 따른 스타일 분기 처리
  - `isRenewable` 판별 기준: `item.renewable !== '연기불가'` (서버 응답값 기준 수정)
  - "연장가능 횟수" 레이블 텍스트 수정 ("연장횟수" → "연장가능 횟수")

#### refactor: StudentCard 실사용자 데이터 연동
- `src/components/StudentCard.tsx`
  - 하드코딩된 목업 데이터("홍길동", "2026123456") 제거
  - `smartCard?.name` 및 `smartCard?.id` 실제 데이터로 교체
