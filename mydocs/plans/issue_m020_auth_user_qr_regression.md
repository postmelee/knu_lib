# Auth/User/QR 흐름 회귀 검증 및 QR 갱신 정책 정리

## 목표

로그인, 세션 저장, 사용자 정보 표시, QR 생성/갱신 흐름을 실제 앱 기준으로 검증하고 정책을 문서화한다.

## 범위

- `app/_layout.tsx` AuthGate 동작 확인
- `src/services/authService.ts` SecureStore 세션 흐름 검토
- `StudentCard`와 User/SmartCard 데이터 연결 확인
- Pull-to-refresh 시 QR/사용자 데이터 갱신 정책 정리

## 검증

- 로그인 전/후 라우팅이 의도대로 동작해야 한다.
- QR 생성 시각과 갱신 동작의 기준이 문서화되어야 한다.
- 실행하지 못한 수동 검증은 사유와 잔여 리스크를 남긴다.

## 참고

- `mydocs/manual/hyper_waterfall_knu_library.md`
- `docs/prd/prd_v2.md`

