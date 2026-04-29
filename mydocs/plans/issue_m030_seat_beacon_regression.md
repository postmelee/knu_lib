# Seat API 암호화/비콘/좌석 액션 회귀 검증

## 목표

Seat Domain의 상태 조회, 좌석맵 파싱, 예약, 연장, 퇴실, 비콘 인증 흐름을 실제 서버 명세와 코드 기준으로 검증한다.

## 범위

- `src/api/seatApi.ts`의 암호화/파라미터 정책 재검토
- `src/services/seatService.ts` 상태 머신과 좌석 파싱 검토
- `src/hooks/queries/useSeat.ts` mutation 후 캐시 무효화 확인
- BLE 비콘 실제 기기 검증 절차와 fallback 정책 문서화

## 검증

- `docs/mitlogs` 또는 실제 응답 기준으로 API 파라미터 정책이 설명되어야 한다.
- 예약/연장/퇴실 실패 메시지 처리 기준이 명확해야 한다.
- 실제 기기 검증이 불가능하면 불가능한 이유와 대체 검증을 기록한다.

## 참고

- `docs/seat_reservation_spec.md`
- `docs/ai_seat_reservation_spec.md`
- `.agents/beacon_analysis.md`

