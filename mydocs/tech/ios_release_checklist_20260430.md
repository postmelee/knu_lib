# iOS 출시 준비 체크리스트 - 2026-04-30

GitHub Issue: https://github.com/postmelee/knu_lib/issues/7

## 결론

현재 앱은 Expo/EAS 기반 iOS 배포 흐름을 사용할 수 있는 구조다. 권장 경로는 `EAS Build`로 production IPA를 만들고, `EAS Submit`으로 App Store Connect/TestFlight에 업로드한 뒤 App Store Connect에서 심사 제출을 마무리하는 방식이다.

실제 업로드 전에는 App Store Connect 앱 레코드 생성, `ascAppId` 확보, Apple Developer 인증, 개인정보/권한 고지, 스크린샷, 현장 실기기 회귀 검증이 남아 있다.

## 현재 설정 상태

| 항목 | 현재 값/상태 | 판단 |
|---|---|---|
| 앱 이름 | `강남대학교 도서관` | App Store 표시명은 30자 제한 안에 있음 |
| Expo slug | `KNU_library` | 내부 식별용으로 사용 가능 |
| 버전 | `1.0.0` | 첫 제출 기준으로 적합 |
| iOS bundleIdentifier | `com.postmelee.KNU-library` | 업로드 전 최종 확정 필요 |
| iOS 권한 문구 | 위치, 블루투스 권한 설명 존재 | 비콘 인증 목적을 설명하고 있음 |
| EAS projectId | `0e3a8675-e72d-42c9-a468-27f21cc700cc` | EAS 프로젝트 연결됨 |
| EAS production build | `autoIncrement: true` | 제출 빌드 번호 관리 가능 |
| EAS submit profile | `production: {}` | `ascAppId`는 App Store Connect 앱 생성 후 추가 필요 |
| 개인정보처리방침 | `docs/privacy_policy.md` 존재, iOS 위치/비콘 문구 보강 | App Store Connect에 공개 URL 필요 |
| App Store 문안 | `mydocs/tech/ios_app_store_metadata_20260430.md` 작성 | 제품 설명, 심사 노트, 개인정보 설문 초안 준비 |

## 로컬 검증 결과

| 명령 | 결과 | 비고 |
|---|---|---|
| `npx expo config --type public` | 통과 | iOS bundleIdentifier, 권한 문구, EAS projectId, updates/runtimeVersion 해석 확인 |
| `npx tsc --noEmit` | 통과 | TypeScript 오류 없음 |
| `git diff --check` | 통과 | 문서 변경 공백 오류 없음 |

## 제출 전 필수 외부 작업

| 작업 | 담당/조건 | 비고 |
|---|---|---|
| Apple Developer Program 등록 | 배포자 | iOS 앱 제출 필수 |
| App Store Connect 앱 레코드 생성 | 배포자 | 앱 이름, bundle id, SKU 확정 |
| Bundle ID 최종 확정 | 배포자 | 첫 빌드 업로드 후 변경 불가 |
| `ascAppId` 확인 | 배포자 | App Store Connect App Information의 Apple ID |
| `eas credentials --platform ios` 설정 | 배포자/빌드 담당 | 인증서, 프로비저닝, ASC API Key |
| 개인정보처리방침 URL 공개 | 배포자 | GitHub Pages, 개인 사이트 등 외부 접근 가능 URL 필요 |
| 지원 URL 준비 | 배포자 | App Store Connect 메타데이터에 필요할 수 있음 |
| 스크린샷 준비 | 배포자 | iPhone 필수 해상도 세트 준비 |
| 개인정보 설문 작성 | 배포자 | 학생 인증정보, 위치, Bluetooth 사용 목적을 정확히 기재 |
| App Review Notes 작성 | 배포자 | 비공식 앱, 심사용 계정, 비콘 현장 제약 설명 |

## EAS 명령

```bash
npx tsc --noEmit
npx expo config --type public
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

빌드와 제출을 한 번에 진행할 때는 다음 명령을 사용할 수 있다.

```bash
eas build --platform ios --profile production --auto-submit
```

`eas.json`에는 App Store Connect 앱 생성 후 다음 값이 필요하다.

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "App Store Connect Apple ID"
      }
    }
  }
}
```

## App Review 리스크

| 리스크 | 내용 | 준비 방향 |
|---|---|---|
| 비공식 앱 고지 | 강남대학교/도서관 공식 앱으로 오인될 수 있음 | 앱 설명, 개인정보처리방침, 심사 노트에 비공식 서드파티 앱임을 명시 |
| 학생 인증정보 입력 | 학번/비밀번호를 앱에 입력함 | 기기 내 SecureStore 저장, 원격 서버 미보관, 도서관 서버 직접 요청 구조를 설명 |
| 위치/블루투스 권한 | 비콘 인증에 위치/BLE 권한 필요 | 열람실 좌석 예약/연장/퇴실 인증 목적을 권한 문구와 심사 노트에 명시 |
| 외부 서버 의존 | `https://lib.kangnam.ac.kr`에 직접 접근 | 사용자 계정으로 도서관 웹 서비스를 이용하는 클라이언트임을 설명 |
| 현장 기능 | 비콘 인증은 도서관 현장에서만 완전 검증 가능 | 심사용 계정, 기능 설명, 제한 상황을 App Review Notes에 제공 |

## 제출 문안 산출물

`mydocs/tech/ios_app_store_metadata_20260430.md`에 다음 초안을 작성했다.

- 제품 페이지 설명, 부제, 키워드, 릴리스 노트
- 비공식 앱 고지와 심사용 계정 안내가 포함된 App Review Notes
- App Privacy 설문 초안
- 암호화/수출 규정 확인 항목
- 스크린샷 촬영 계획

## iOS 실기기 회귀 검증

| 도메인 | 시나리오 | 결과 기록 |
|---|---|---|
| 설치/시작 | TestFlight 설치 후 첫 실행, 권한 팝업 문구 확인 | 미실행 |
| 로그인 | 유효 계정 로그인, SecureStore 세션 복원, 로그아웃 | 미실행 |
| QR | 학생증 QR 표시, QR 갱신, 빈/오류 상태 | 미실행 |
| 좌석 조회 | 열람실 목록, 좌석맵, 점검/오류 상태 | 미실행 |
| 비콘 인증 | 도서관 현장 iOS 기기에서 iBeacon 탐지 | 미실행 |
| 좌석 예약 | 비콘 인증 후 좌석 예약 성공/실패 메시지 | 미실행 |
| 좌석 연장/퇴실 | 서버 응답 기준 연장/퇴실 처리 | 미실행 |
| 대출 | 대출 목록, 상세, 연장 가능/불가 상태 | 미실행 |
| 네트워크 오류 | 서버 장애/세션 만료/권한 거부 상태 | 미실행 |

## 제출 전 결정 필요

- iOS 번들 식별자 `com.postmelee.KNU-library`를 그대로 사용할지, 첫 업로드 전에 더 일반적인 소문자 reverse-DNS 값으로 바꿀지 결정한다.
- 개인정보처리방침을 외부 공개 URL로 배포한다.
- 심사용 계정을 제공할 수 있는지 확인한다.
- 강남대학교 명칭과 도서관 서버 사용에 대한 설명 문구를 App Store 메타데이터에 반영한다.
