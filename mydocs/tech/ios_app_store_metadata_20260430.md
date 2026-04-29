# iOS App Store 메타데이터 초안 - 2026-04-30

GitHub Issue: https://github.com/postmelee/knu_lib/issues/7

## 목적

App Store Connect 앱 레코드 생성 후 바로 참고할 수 있도록 제품 페이지 문안, 심사 노트, 개인정보 설문, 스크린샷 계획을 정리한다.

이 문서는 제출 전 초안이다. 실제 App Store Connect 입력 전에는 배포자 계정, 심사용 계정, 개인정보처리방침 공개 URL, 지원 URL, 최종 번들 식별자를 확정해야 한다.

## 제품 페이지 초안

| 항목 | 초안 |
|---|---|
| 앱 이름 | 강남대학교 도서관 |
| 부제 | 열람실 좌석과 대출을 한곳에서 |
| 기본 언어 | 한국어 |
| 카테고리 1차 | 교육 |
| 카테고리 2차 | 생산성 또는 유틸리티 |
| 가격 | 무료 |
| 개인정보처리방침 URL | 공개 URL 준비 필요 |
| 지원 URL | 공개 URL 준비 필요 |

## 설명

강남대학교 도서관 이용을 더 간편하게 돕는 비공식 서드파티 앱입니다.

학생증 QR, 열람실 좌석 현황, 좌석 예약/연장/퇴실, 도서 대출 목록과 상세 정보를 모바일에서 확인할 수 있습니다. 열람실 좌석 인증이 필요한 경우 도서관 내 비콘 신호를 확인하기 위해 위치 및 블루투스 권한을 사용합니다.

본 앱은 강남대학교 또는 강남대학교 중앙도서관의 공식 앱이 아닙니다. 사용자가 입력한 학번과 비밀번호는 기기 내 안전 저장소에 보관되며, 도서관 기능 사용을 위해 강남대학교 도서관 서버로 직접 전송됩니다. 개발자는 별도의 원격 서버를 운영하거나 사용자의 인증정보를 수집하지 않습니다.

## 프로모션 문구

강남대학교 도서관의 학생증 QR, 열람실 좌석, 대출 정보를 모바일에서 확인하세요.

## 키워드 초안

```text
강남대학교,도서관,열람실,좌석예약,학생증,QR,대출,연장
```

## 첫 버전 릴리스 노트

```text
강남대학교 도서관 이용을 위한 첫 iOS 버전입니다.
- 학생증 QR 표시
- 열람실 좌석 현황 조회
- 비콘 인증 기반 좌석 예약, 연장, 퇴실
- 대출 도서 목록, 상세, 연장 가능 상태 확인
```

## App Review Notes 초안

```text
This app is an unofficial third-party client for Kangnam University Library users. It is not an official app from Kangnam University or Kangnam University Library.

The app requires a valid Kangnam University library account to access user-specific features such as student QR, active seat status, seat reservation, and loan records. The app does not operate a separate backend server. User credentials are stored only on the device using secure storage and are sent directly to https://lib.kangnam.ac.kr over HTTPS when the user uses library features.

Bluetooth and location permissions are used only for reading-room beacon verification. The app scans for the library iBeacon signal and sends the beacon major/minor/RSSI values to the library server for seat authentication. The app does not track the user's continuous location.

Some seat reservation and beacon verification flows can only be completed inside the Kangnam University library reading rooms where the physical beacon is installed. If a reviewer cannot access the physical location, please use the provided account to review login, QR, seat list, loan list, and error states. A full beacon reservation test requires on-site access.

Reviewer account:
- ID: 제공 필요
- Password: 제공 필요
```

## 심사용 계정 준비

| 항목 | 상태 | 비고 |
|---|---|---|
| 심사용 학번/계정 | 준비 필요 | 실제 도서관 서버 로그인이 가능한 계정 필요 |
| 비밀번호 | 준비 필요 | App Review Notes에는 임시 심사용 비밀번호 사용 권장 |
| 계정 권한 | 확인 필요 | QR, 좌석, 대출 조회가 가능한 계정이어야 함 |
| 대출 테스트 데이터 | 선택 | 대출 도서가 없으면 빈 상태 검증만 가능 |
| 좌석 예약 테스트 | 현장 필요 | 비콘 설치 위치 접근 없이는 성공 케이스 검증 제한 |

## 스크린샷 계획

| 순서 | 화면 | 보여줄 내용 |
|---|---|---|
| 1 | 로그인 | 강남대학교 도서관 로그인 화면 |
| 2 | 홈/학생증 | 학생증 QR과 주요 정보 |
| 3 | 열람실 목록 | 열람실별 잔여 좌석 현황 |
| 4 | 좌석맵 | 좌석 선택, 사용 중/가능 상태 |
| 5 | 이용 중 좌석 | 좌석 연장/퇴실 액션 |
| 6 | 대출 목록 | 현재 대출 도서와 연장 가능 상태 |
| 7 | 설정 | 건의사항 보내기, 로그아웃, 버전 정보 |

스크린샷에는 실제 학번, 이름, QR 값, 대출 정보가 노출되지 않도록 테스트 계정 또는 마스킹 데이터를 사용한다.

## App Privacy 설문 초안

아래 표는 App Store Connect의 개인정보 설문을 작성하기 위한 보수적 초안이다. Apple의 설문 표현과 최종 배포자 판단에 맞춰 제출 전에 재확인한다.

| 데이터 유형 | 앱 내 사용 | 연결 여부 초안 | 추적 여부 |
|---|---|---|---|
| User ID | 학번을 도서관 서버 로그인과 좌석/대출 요청에 사용 | 사용자 계정에 연결됨 | 추적 아님 |
| Sensitive Info 또는 Other Data | 비밀번호를 도서관 서버 인증에 사용 | 사용자 계정에 연결됨 | 추적 아님 |
| Location | iOS 위치 권한은 iBeacon ranging을 위해 사용. GPS 좌표를 수집/전송하지 않음 | 실제 위치 좌표 미수집 기준으로 최종 확인 필요 | 추적 아님 |
| Other Diagnostic Data | 건의사항 메일 본문에 앱 버전이 자동 포함됨 | 사용자가 메일을 보낼 때만 제공 | 추적 아님 |
| User Content | 대출 목록/도서명은 도서관 서버에서 조회해 앱에 표시 | 앱 개발자 서버에는 저장하지 않음 | 추적 아님 |

## 암호화/수출 규정 확인 항목

앱은 HTTPS 통신, iOS Keychain 기반 `expo-secure-store`, 그리고 `src/utils/crypto.ts`의 Sponge 기반 서버 요청 암호화를 사용한다.

따라서 App Store Connect의 수출 규정 문항에서 `ITSAppUsesNonExemptEncryption=false`를 기계적으로 설정하지 않는다. 다음 기준으로 배포자가 최종 판단한다.

- 표준 HTTPS/TLS와 OS 보안 저장소만 사용한다고 볼 수 있는지 확인
- `src/utils/crypto.ts`의 Sponge 암호화가 도서관 서버 호환용 요청 인코딩인지, 독자 암호화 기능 제공으로 분류될 여지가 있는지 확인
- 필요하면 App Store Connect의 Export Compliance 문항에서 커스텀 암호화 사용 여부를 보수적으로 답변

## 제출 전 문안 확정 체크

- App 이름이 강남대학교 공식 앱으로 오인되지 않도록 설명 첫 문단과 심사 노트에 비공식 앱 고지를 유지한다.
- 개인정보처리방침 URL은 외부에서 로그인 없이 접근 가능해야 한다.
- 지원 URL 또는 문의 이메일 경로를 제품 페이지에 제공한다.
- 심사용 계정은 실제 계정이므로 제출 후 비밀번호 교체 또는 폐기 절차를 정한다.
- 스크린샷은 개인정보와 QR 값을 노출하지 않는다.
