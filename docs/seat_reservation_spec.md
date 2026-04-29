# 도서관 좌석 예약 앱 개발 명세서

본 문서는 강남대학교(또는 동일한 Clicker 시스템을 사용하는 도서관)의 좌석 예약 기능을 완벽하게 구현하기 위한 API 규격 및 유저 플로우 분기 처리 가이드입니다.

---

## 1. 공통 사항 및 사전 설정

### 1.1 기본 정보
- **Base URL**: `https://lib.kangnam.ac.kr`
- **모든 API 방식**: `GET` (파라미터는 Query String으로 전달)
- **응답 형식**: JSON (일부 페이지는 WebView용 HTML 반환)

### 1.2 암호화 (Sponge Algorithm 및 Plain Text)
- `GetMyInformation` 에서는 `userid`, `userpass`에 커스텀 `Sponge` 암호화가 필수입니다.
- **그 외의 열람실 좌석 배정, 비콘, 연장, 반납 API**는 URL 인코딩된 **Plain Text (일반 텍스트)** 학번과 비밀번호를 전송해야 합니다.

### 1.3 HTTP Headers (User-Agent)
앱 구별 및 보안을 위해 특정 패턴의 User-Agent를 사용해야 합니다.
- 형식: `{기본_UA} spongeapp{앱버전} spongeandroid {SpongeEncrypt(yyyyMMddHHmmss)}`

---

## 2. 유저 플로우 및 상태 관리

앱 실행 시 가장 먼저 유저의 현재 좌석 배정 상태를 확인해야 합니다. 이에 따라 메인 화면의 속성과 제공되는 기능이 달라집니다.

### 2.1 사용자 상태 확인 API (GetMyInformation)
앱 구동 시 혹은 화면 갱신 시마다 호출하여 상태를 확인합니다.

```http
GET /Clicker/GetMyInformation
  ?userid={Sponge_URL_Encoded_ID}
  &userpass={Sponge_URL_Encoded_PW}
  &l_gubun=1
  &login=false    // 명시적 로그인이면 true
  &differentapp=
```

**[ 응답 분기 처리 ]**
응답 JSON의 `l_clicker_user_status_open` 값과 `g_clicker_user_clicker_count` 값을 기준으로 분기합니다.

* `l_communication_status` != "0": 로그인 실패 또는 세션 만료 → **로그인 화면으로 이동**
* `g_clicker_user_clicker_count` == "0": **[미이용 상태]**
  - 메인 화면에 열람실 리스트 진입 버튼 표시
  - `g_clicker_user_l_favorite_seat_id` (즐겨찾기 좌석 ID), `g_clicker_user_l_before_seat_id` (이전 이용 좌석 ID) 값이 있으면 **바로 예약 버튼** 노출
* `g_clicker_user_clicker_count` != "0": **[이용 중 상태]**
  - `l_clicker_user_status_open` == "1": 정상 이용 중
    - `l_clicker_user_status_seat_room_name` (열람실명) 표시
    - `l_clicker_user_status_seat_number` (좌석번호) 표시
    - `l_clicker_user_status_seat_time_start` ~ `l_clicker_user_status_seat_time_stop` (이용시간) 계산하여 남은 시간 타이머 표시 UI 렌더링
    - **반납 버튼 노출**
    - `g_clicker_l_flag_clicker_button_extend` == "true" 이면 **연장 버튼 노출**
  - `l_clicker_user_status_open` == "2" (외출 등 다른 상태):
    - `l_clicker_user_status` (상태 텍스트)만 표시

> **게이트 인증 (분기)**
> `l_clicker_user_status_need_gateconfirm` == "1" 이면, UI에 붉은 글씨로 **"(인증 필요)"** 텍스트를 노출해야 합니다.

---

## 3. 열람실 조회 및 좌석 배정 플로우

### 2. 열람실 목록 조회 API `[GET] /clicker/GetClickerReadingRooms`

**[요청 사항]**
*   **Method**: `GET`
*   **URL**: `https://lib.kangnam.ac.kr/clicker/GetClickerReadingRooms?groupcode=`
*   **Headers**: 일반적인 브라우저/앱 헤더 및 **인증 쿠키 (`ASP.NET_SessionId`) 필수**

**[응답 형태 (JSON)]**
열람실의 기본 정보와 좌석 현황을 제공하는 객체의 배열이 `_Model_lg_clicker_reading_room_brief_list` 키 안에 담겨 반환됩니다.

```json
{
  "_Model_lg_clicker_reading_room_brief_list": [
    {
      "l_id": "20180422143657380",                 // 열람실 ID
      "l_room_name": "제1열람실(지하1층)",           // 열람실 이름 (View 표시용)
      "l_count": 272,                             // 전체 좌석 수
      "l_occupied": 50,                           // 사용 중인 좌석 수
      "l_open_mode": "open",                      // 오픈 상태 ("open" 또는 "close")
      "l_flag_beacon_validation": 1,              // 비콘 인증 필요 여부 (0: 불필요, 1: 필요, View 로직 제어용)
      "l_group_code": "20180422143616998"         // 소속 그룹 코드
    },
    // ... 추가 열람실 데이터
  ]
}
```

**[View 및 데이터 연결 활용 방법]**
*   **렌더링**: `_Model_lg_clicker_reading_room_brief_list` 배열을 순회하여 열람실 리스트 View 컴포넌트(ListView, FlatList 등)를 렌더링합니다.
*   **UI 표현**: `l_room_name`(이름), `l_count`(전체), `l_occupied`(사용중)을 활용해 "제1열람실 (50 / 272)" 같은 형태로 표시합니다.
*   **다음 단계 파라미터**: 사용자가 특정 열람실을 클릭하면 해당 객체의 `l_id`와 `l_flag_beacon_validation`을 추출하여 다음 화면(좌석 배치도 또는 비콘 인증)으로 넘깁니다.

---

## 3. 비콘 인증 API (좌석 배정 전/후 검증) `[GET] /Beacon/DoClickerBeaconAction`

**[요청 사항]**
*   **Method**: `GET`
*   **URL**: `https://lib.kangnam.ac.kr/Beacon/DoClickerBeaconAction`
*   **Query Parameters**:
    *   `Uid` : 비콘 앱 기기 ID, `UserId` : 학번, `UserPass` : 비밀번호, `Name`=reco, `Major`=10001, `Minor`=103 (또는 구역코드), `Rssi`=0

**[응답 형태 (JSON)]**
비콘 인증 성공 여부와 검증 값을 반환합니다.

```json
{
  "l_communication_status": "1",                 // 통신/인증 상태 (1: 성공)
  "l_communication_beacon_id": "24dd...-10001-103", // 생성된/확인된 비콘 조합 ID (다음 좌석 배정 API에 전달 필요)
  "l_communication_clicker_roomname": "강남대학교 중앙도서관",
  "l_communication_task": "g",
  "l_communication_message": "배정된 좌석이 확인되지 않습니다. 비콘 배정으로 이동합니다."
}
```

**[View 및 데이터 연결 활용 방법]**
*   **상태 체크**: `l_communication_status` 값이 `"1"`인지 확인하여 비콘 인증 통과 여부를 검증합니다. 실패 시 `l_communication_message`를 Toast나 Alert View로 띄워줍니다.
*   **다음 단계 파라미터**: 성공 시 반환되는 `l_communication_beacon_id` 문자열을 상태(State)에 저장해두고, 직후에 호출될 좌석 배정(UserSeatMobile) 또는 연장(ExtendReadingSeat) API의 `Beacon` 파라미터로 넘겨주어야 합니다.

---

## 4. 좌석 배정 API `[GET] /Clicker/UserSeatMobile/...`

**[요청 사항]**
*   **Method**: `GET`
*   **URL**: `https://lib.kangnam.ac.kr/Clicker/UserSeatMobile/{SeatId}`
*   **Query Parameters**:
    *   `userid`, `userpass`, `devicename`=iphone, `guid`, `Beacon` (비콘 인증 API에서 받은 ID), `RequestDateTime` 등 (암호화 필요)

**[응답 형태 (HTML 또는 JSON)]**
*주로 모바일 API로서 모달이나 스크립트가 포함된 HTML View를 직접 반환하거나, 에러 상황에서는 특정 모달 View를 렌더링하기 위한 데이터를 포함합니다.* 성공 시엔 좌석 배정 상태가 시스템 쿠키(Session)에 저장됩니다.

**[View 및 데이터 연결 활용 방법]**
*   경우에 따라 HTML이 반환되면 그 내부의 Alert 메시지를 정규식으로 추출해 앱의 커스텀 다이얼로그나 Toast View에 띄웁니다.
*   정상 동작이 완료된 후, 홈 화면이나 마이페이지(사용자 정보 조회) API를 다시 호출하여 현재 배정된 좌석 정보를 동기화 시켜야 합니다.

---

## 5. 좌석 연장 API `[GET] /Clicker/ExtendReadingSeat`

**[요청 사항]**
*   **Method**: `GET`
*   **URL**: `https://lib.kangnam.ac.kr/Clicker/ExtendReadingSeat`
*   **Query Parameters**:
    *   `strId`={SeatId/TransactionId}, `strUserId`, `strUserPass`, `Beacon` (비콘 인증 API에서 받은 ID) 등

**[응답 형태 (JSON - 시스템 동기화 Payload)]**
앱의 전체 권한 및 상태를 동기화하는 대규모 통합 JSON (`_LibTechPageCommon` 래퍼)이 반환됩니다. 성공 여부는 내부의 로그인 상태 코드나 메시지 등으로 판별합니다.

```json
{
  "g_clicker_login_result": 1,          // 1: 성공, 0: 실패
  "clicker_global_book_error_message": "", // 실패 시 메시지 (ex: "연장 가능 시간이 아닙니다.")
  "UserInfo": [
    {
        // ... (현재 배정된 좌석 상세 데이터, 새로운 종료 시간 등 업데이트 됨)
    }
  ],
  "_ClickerBeaconUsageStatus": []
}
```

**[View 및 데이터 연결 활용 방법]**
*   `g_clicker_login_result` 값을 확인하여 연장 성공 토스트 메시지를 표시합니다.
*   값이 0(실패)일 경우, `clicker_global_book_error_message`의 문자열을 추출하여 연장 불가의 사유(예: "연장 시간에 임박하지 않음")를 View의 Error Label이나 Alert로 나타냅니다.
*   성공 시 `UserInfo` 오브젝트 내의 종료 시간(EndTime) 텍스트를 파싱하여 View의 잔여 시간 타이머를 업데이트합니다.

---

## 6. 좌석 반납(퇴실) API `[GET] /Clicker/ReleaseReadingSeat`

**[요청 사항]**
*   **Method**: `GET`
*   **URL**: `https://lib.kangnam.ac.kr/Clicker/ReleaseReadingSeat`
*   **Query Parameters**:
    *   `seatid`={현재 배정된 SeatId/TransactionId}, `userid`, `userpass` 암호화 문자열 등

**[응답 형태 (JSON - 시스템 동기화 Payload)]**
연장 API와 동일한 거대 프레임워크 JSON이 반환됩니다.

**[View 및 데이터 연결 활용 방법]**
*   `g_clicker_login_result` 또는 `clicker_global_book_error_message`를 파싱하여 반납 성공 여부를 파악합니다.
*   성공했다면 홈 View의 상태를 "좌석 미배정(예약 가능)" 상태로 초기화시키고 반납 완료 문구를 View상에 노출합니다.
- `l_flag_beacon_validation` (비콘 검증 필요 여부):
  - "true": 좌석 배정 전 비콘 인증 절차로 진입
  - "false": 즉시 좌석 배정 페이지(WebView)로 진입

### 3.2 비콘 인증 절차 (선택적)
`l_flag_beacon_validation`이 "true"인 열람실 선택 시, BLE 스캔을 수행합니다. 검색해야 할 타겟 UUID는 `24ddf411-8cf1-440c-87cd-e368daf9c93e` 입니다.

1. 타겟 비콘을 찾으면 Major, Minor, RSSI 값을 추출
2. 비콘 정보를 서버로 전송 (DoClickerBeaconAction)
```http
GET /Beacon/DoClickerBeaconAction
  ?Uid=24ddf4118cf1440c87cde368daf9c93e
  &UserId={Plain_ID}
  &UserPass={Plain_PW}
  &Name=RECO
  &Major={major}
  &Minor={minor}
  &Rssi={rssi}
  &Wifi={SSID_or_IP}
  &WifiMac={BSSID}
```
**[ 응답 분기 처리 ]**
* `l_communication_status` == "1": 성공. 응답의 `l_communication_beacon_id` 저장 후 다음 단계로 진행.
* 실패하거나 타임아웃(10초) 발생 시 => **WiFi 인증으로 폴백 (Fallback)**
  - 현재 연결된 도서관 WiFi IP가 서버에 등록된 IP 대역(`seatIpList`)에 속하는지 앱 내에서 검사. 일치 시 비콘 아이디 없이 다음 단계 진행.

### 3.3 좌석 배정 (ReadingRoomAction)
클라이언트가 WebView 없이 직접 대상 좌석을 예약하려면 백엔드 API인 `ReadingRoomAction` 을 호출합니다.

```http
GET /Clicker/ReadingRoomAction
  ?ActionCode=0
  &SeatId={target_seat_id}
  &UserId={Plain_ID}
  &UserPass={Plain_PW}
  &DeviceName=android
  &Kiosk=false
  &Guid={Plain_GUID}
  &Wifi={SSID_or_IP}
  &Scanner=
  &Geolocation=0
  &Beacon={l_communication_beacon_id}  // 비콘우회/WiFi 폴백 시 빈 문자열
  &Eng=False
```
요청 후 응답(JSON)의 상태를 확인하여 배정을 확정합니다. 이후 상태 동기화를 위해 `GetMyInformation` 을 호출해야 합니다.

---

## 4. 좌석 반납 및 연장 플로우

좌석을 이용 중인 경우 메인 UI에서 접근할 수 있는 동작입니다. 대상 좌석 ID는 2.1항의 `l_clicker_user_status_seat_id` 값을 사용합니다.

### 4.1 반납 (ReleaseingSeat)
반납 버튼 클릭 시 확인 다이얼로그를 띄워야 합니다.

**[ 사전 확인 분기 (반복 취소 방지) ]**
2.1항 응답에서 `g_clicker_l_flag_repeat_cancel_seat` == "true" 이면, 취소 시 패널티(재배정 대기 시간 등)가 발생할 수 있습니다.
- 다이얼로그 텍스트에 응답받은 `g_clicker_l_repeat_cancel_seat_message` 추가. ("예: 반납하시겠습니까? 한 번 취소한 좌석은 일정 시간 동안 다시 배정할 수 없습니다.")

```http
GET /Clicker/ReleaseReadingSeat
  ?SeatId={l_clicker_user_status_seat_id}
  &userid={Plain_ID}
  &userpass={Plain_PW}
  &devicename=android
```

- 요청 후 `l_communication_status` == "0" 이면 반납 성공 액션 후, `GetMyInformation` 을 다시 호출해 메인화면을 갱신합니다.

### 4.2 연장 (ExtendReadingSeat)
연장 버튼을 클릭할 때 동작합니다. 일부 대학교에서는 연장 시 위치 확인(비콘)을 다시 강제하기도 합니다.

**[ 사전 확인 분기 (비콘 재검증) ]**
- 서버 설정 `g_clicker_l_flag_beacon` 값이 "true" 이면, 연장 버튼을 누를 때 3.2항의 비콘 스캔/인증 절차를 한 번 더 거칩니다.

```http
GET /Clicker/ExtendReadingSeat
  ?strId={l_clicker_user_status_seat_id}
  &strUserId={Plain_ID}
  &strUserPass={Plain_PW}
  &strDeviceName=android
  &strKiosk=false
  &Wifi={SSID_or_IP}
  &Scanner=
  &Beacon={beacon_id} // 비콘 인증을 거쳤다면 ID 삽입
```

**[ 응답 분기 처리 ]**
- `l_communication_status` == "0": 연장 성공
- `l_communication_status` != "0": 연장 실패. 실패 원인(예매 가능 시간 아님, 최대 연장 횟수 초과 등)은 응답의 `l_communication_message` 값에 서버가 HTML/문자열 형태로 내려주므로 **이를 그대로 사용자에게 다이얼로그로 팝업**해 주면 됩니다. 최대 횟수 등의 정책은 모두 서버에서 제어됩니다.

---

## 5. 앱 구동 예외 처리 (로그아웃 연동)

사용자가 **이용중인 좌석이 있는 상태에서 로그아웃** 버튼을 누를 경우, 자동 반납 처리가 되도록 분기가 필요합니다.

1. 로그아웃 버튼 터치 이벤트
2. `g_clicker_user_clicker_count` != "0" 인지 검사
3. 이용 중이라면: `"로그아웃 시, 배정받은 좌석이 반납됩니다. 로그아웃하시겠습니까?"` 팝업
4. [확인] 선택 시, **좌석 반납(4.1항) API 호출 후** 로컬 로그인 세션 초기화 및 로그인 창 표시.
