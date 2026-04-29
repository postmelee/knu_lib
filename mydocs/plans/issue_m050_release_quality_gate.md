# Expo dev client 빌드/권한/배포 품질 관문 정리

## 목표

배포 전 품질 관문을 정의하고, Expo dev client 및 iOS/Android 네이티브 권한/빌드 상태를 검증한다.

## 범위

- Expo dev client 빌드 절차 정리
- BLE/위치 권한 문서화
- 개인정보 처리방침과 민감 로그 점검
- iOS/Android 실행 검증 체크리스트 작성

## 검증

- 변경 영향에 맞는 `npm run ios`, `npm run android`, 또는 대체 검증 결과를 기록한다.
- 실행하지 못한 빌드/기기 검증은 사유와 잔여 리스크를 남긴다.
- 배포 전 문서와 개인정보/로그 정책이 정리되어야 한다.

## 참고

- `mydocs/manual/hyper_waterfall_knu_library.md`
- `docs/privacy_policy.md`

