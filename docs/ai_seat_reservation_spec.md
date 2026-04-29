# System Profile: KNU Library Seat Reservation API
**Goal**: Implement a complete seat reservation client with full state management.

## 1. Core Architecture & Cryptography
- **BaseURL**: `https://lib.kangnam.ac.kr`
- **Method**: All requests must use `GET`.
- **Payload Location**: URL Query Parameters.
- **Encryption Requirement**: Current app code applies custom `Sponge` encryption to user ID and password parameters for `GetMyInformation`, Beacon, Action, Extend, and Release calls.
  - `src/api/seatApi.ts` uses `spongeEncrypt()` and URL-encodes the encrypted values.
  - Older notes may mention mixed plaintext behavior; do not use those notes as the current implementation baseline.
- **User-Agent Requirement**: Must match exact format to bypass WAF/Server blocks.
  - Format: `{Base_UA} spongeapp{App_Version} spongeandroid {SpongeEncrypt(Timestamp_yyyyMMddHHmmss)}`

---

## 2. Global State Management (State Machine)
The client must maintain an internal state driven by the `GetMyInformation` API. Every UI interaction starts by evaluating this state.

### 2.1 State Evaluation API
```http
GET /Clicker/GetMyInformation
  ?userid={ENC(id)}&userpass={ENC(pw)}&l_gubun=1&login=false&differentapp=
```

### 2.2 Response Schema & State Transitions
Assume response JSON `res`.

```typescript
// State Enum
enum UserState {
    UNAUTHORIZED = 0, // login failed or token expired
    IDLE = 1,         // logged in, no active seat
    SEATED = 2,       // logged in, actively using a seat
    AWAY = 3          // logged in, seat reserved but user is temporarily away (or other status)
}

function evaluateState(res: any): UserState {
    if (res.l_communication_status !== "0") return UserState.UNAUTHORIZED;
    if (res.g_clicker_user_clicker_count === "0") return UserState.IDLE;
    if (res.l_clicker_user_status_open === "1") return UserState.SEATED;
    return UserState.AWAY;
}
```

### 2.3 Context Extraction (When State is SEATED)
Extract the following attributes strictly when `UserState.SEATED`:
- `seat_id`: `res.l_clicker_user_status_seat_id` (CRITICAL: Used for extend/cancel)
- `room_name`: `res.l_clicker_user_status_seat_room_name`
- `seat_number`: `res.l_clicker_user_status_seat_number`
- `time_start`: `res.l_clicker_user_status_seat_time_start`
- `time_stop`: `res.l_clicker_user_status_seat_time_stop`
- `can_extend`: `res.g_clicker_l_flag_clicker_button_extend === "true"`

### 2.4 Re-reservation Context (When State is IDLE)
Extract to enable quick re-booking:
- `favorite_seat_id`: `res.g_clicker_user_l_favorite_seat_id`
- `before_seat_id`: `res.g_clicker_user_l_before_seat_id`

---

## 3. Operations & Branching Logic (Request & Response Details)

### 3.1 Fetching Rooms (Context: IDLE)

**[ Request ]**
```http
GET /Clicker/GetClickerReadingRooms
```

**[ Response ]**
JSON 형식이며, 배열 형태로 열람실 정보를 반환합니다. 앱은 이 데이터를 순회하여 현황판(대시보드)을 렌더링해야 합니다.
```json
// Path: _Model_lg_clicker_reading_room_brief_list
[
  {
    "l_id": "20180422143657380",
    "l_room_name": "제1열람실(지하1층)",
    "l_count": 272,
    "l_occupied": 50,
    "l_flag_beacon_validation": 1
  }
]
```
> **CRITICAL Data Binding:** FlatList 등을 통해 렌더링 후, 사용자가 클릭한 항목의 `l_id`와 `l_flag_beacon_validation` 속성을 다음 화면(예약/비콘)으로 전달하는 파라미터로 사용해야 합니다.

**[ Branching Logic ]**
- IF `res.l_flag_beacon_validation == "true"` -> Proceed to Phase 3.2 (Beacon Auth).
- IF `res.l_flag_beacon_validation == "false"` -> Proceed to Phase 3.3 (Web Reservation).

### 3.2 Beacon Authentication (Context: Validation Required)
Client must perform BLE scan or use mock location data.
- **Target Beacon UUID**: `24ddf411-8cf1-440c-87cd-e368daf9c93e`

**[ Request ]**
```http
GET /Beacon/DoClickerBeaconAction
  ?Uid=24ddf4118cf1440c87cde368daf9c93e
  &UserId={SPONGE_URL_ENCODED_ID}&UserPass={SPONGE_URL_ENCODED_PW}
  &Name=RECO&Major=10001&Minor=103&Rssi=0
  &Wifi={SSID}&WifiMac={BSSID}
```
*(Major/Minor 값은 고정값으로 Mocking하여 송신 가능합니다. 로그 기반 기본값: Major=10001, Minor=103)*

**[ Response ]**
```json
{
  "l_communication_status": "1",
  "l_communication_beacon_id": "24ddf4118cf1440c87cde368daf9c93e-10001-103",
  "l_communication_message": "배정된 좌석이 확인되지 않습니다. 비콘 배정으로 이동합니다."
}
```
> **CRITICAL Data Binding:** `l_communication_status`가 "1"인 경우에만 성공입니다. 성공 시 발급받은 `l_communication_beacon_id` 문자열을 반드시 애플리케이션 상태(State)에 임시 보관해야 하며, **즉시 이어지는 좌석 배정(3.3) 및 향후 자리 연장(3.4) API 호출 시 `Beacon=` 쿼리 파라미터에 전달해야만 합니다.** 이를 누락하면 도서관 서버에서 요청을 거부합니다.

### 3.3 Seat Reservation (Context: Ready to Book)
The client can bypass the WebView HTML and directly call the backend assignment API (`ReadingRoomAction`) with `ActionCode=0`.

**[ Request ]**
```http
GET /Clicker/ReadingRoomAction
  ?ActionCode=0
  &SeatId={target_seat_id}
  &UserId={SPONGE_URL_ENCODED_ID}&UserPass={SPONGE_URL_ENCODED_PW}
  &DeviceName=android&Kiosk=false
  &Guid={guid}&Wifi={SSID}&Scanner=&Geolocation=0
  &Beacon={auth_beacon_id_from_phase_3.2}&Eng=False
```
> **CRITICAL Input:** 이전 단계(3.2)에서 받은 비콘 ID를 `Beacon=` 속성에 주입하세요. 비콘 검증이 불필요한 열람실이었다면 빈 문자열을 전송합니다.

**[ Response ]**
시스템 상태가 포함된 거대 JSON, 또는 JS Alert가 포함된 HTML 문자열이 반환될 수 있습니다. 응답의 형태보다 내부 텍스트 파싱 결과가 중요합니다.
```json
{
  "g_clicker_login_result": 0,
  "clicker_global_book_error_message": "이미 배정된 좌석입니다.",
  "UserInfo": [ /* 사용자 상태 갱신 데이터 */ ]
}
```
> **CRITICAL Data Binding:** 성공/실패 여부를 판단할 때 단일 응답 상태 코드가 아니라, JSON 내부의 `clicker_global_book_error_message` 문자열 유무를 파싱해 결정합니다. 에러 메시지가 문자열로 존재하면 Alert 뷰를 띄워 차단하고, 작업에 통과했다면 (혹은 HTML 응답에서 에러 얼럿이 없다면) 배정 성공입니다. 성공 후 반드시 Phase 2 (State Evaluation) API를 재호출하거나 반환된 `UserInfo`를 파싱해 홈 뷰의 좌석 정보와 잔여 시간을 렌더링해야 합니다.

### 3.4 Extending Seat (Context: SEATED && can_extend == true)

**Pre-condition Branch**: Check server global flag `g_clicker_l_flag_beacon` (from `GetClickerClientLibraryInformation` API or `GetMyInformation`).
- IF `"true"`: Client must perform Phase 3.2 (Beacon Authentication) again before calling Extend API.

**[ Request ]**
```http
GET /Clicker/ExtendReadingSeat
  ?strId={seat_id_from_context}
  &strUserId={SPONGE_URL_ENCODED_ID}&strUserPass={SPONGE_URL_ENCODED_PW}
  &strDeviceName=android&strKiosk=false
  &Wifi={SSID}&Scanner=&Beacon={auth_beacon_id_from_phase_3.2_or_empty}
```
> **CRITICAL Input:** 연장 전 비콘 검증(3.2)을 거쳤다면, 새로 갱신된 비콘 ID를 `Beacon=`에 주입해야 도서관 밖 원격 연장 어뷰징을 회피할 수 있습니다.

**[ Response ]**
좌석 배정(3.3)과 동일하게 에러 메시지 검증용 속성을 가진 시스템 JSON 객체가 반환됩니다.
```json
{
  "g_clicker_login_result": 0,
  "clicker_global_book_error_message": "종료 1시간 전부터 연장 가능합니다.",
  "UserInfo": [ /* 연장된 종료 시간 등 갱신된 사용자 상태 데이터 */ ]
}
```
> **CRITICAL Data Binding:** `clicker_global_book_error_message` 문자열 유무를 파싱하여, 메시지가 있다면 실패 사유(예: "종료 1시간 전부터 연장 가능합니다")를 즉시 Alert로 노출시킵니다. 에러가 없다면 연장 성공 처리 후 `UserInfo`를 파싱하여 뷰의 표시 타이머를 갱신합니다.

### 3.5 Canceling/Releasing Seat (Context: SEATED)

**Pre-condition Branch**:
Check `res.g_clicker_l_flag_repeat_cancel_seat` (from Phase 2).
- IF `"true"`: Render a warning dialog using string from `res.g_clicker_l_repeat_cancel_seat_message` before confirming cancellation.

**[ Request ]**
```http
GET /Clicker/ReleaseReadingSeat
  ?SeatId={seat_id_from_context}
  &userid={SPONGE_URL_ENCODED_ID}&userpass={SPONGE_URL_ENCODED_PW}&devicename=android
```

**[ Response ]**
좌석 배정, 연장 체계와 동일한 거대 시스템 JSON 포맷이 반환되며, 내부 메시지 및 상태 리셋 정보가 포함됩니다.
```json
{
  "g_clicker_login_result": 1,
  "clicker_global_book_error_message": "",
  "UserInfo": [ /* 예약 없음으로 초기화된 사용자 상태 데이터 */ ]
}
```
> **CRITICAL Data Binding:** 반납/퇴실 완료 후, 성공 여부에 무관하게 State Evaluation(Phase 2) 코드를 다시 실행하거나 `UserInfo` 객체를 파싱하여 홈 화면 렌더링 상태를 즉시 `IDLE`(예약 전 상태)로 초기화시킵니다.

### 3.6 Event: User Logout (Context: Any)
- Evaluate current State.
- IF `State === SEATED`:
  - Show warning: "Seat will be released on logout."
  - Invoke Phase 3.5 (Release Seat) synchronously.
- Clear local credentials.
