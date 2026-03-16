#!/usr/bin/env python3
"""
강남대 도서관 열람실 좌석 대여 API 클라이언트
디컴파일된 APK 분석 기반으로 구현
"""

from __future__ import annotations

import random
import urllib.parse
import requests
import json
import sys
from datetime import datetime
from typing import Optional


# ──────────────────────────────────────────────
#  설정
# ──────────────────────────────────────────────

BASE_URL = "https://lib.kangnam.ac.kr"

# ⚠️ 실제 학번/비밀번호로 교체
USER_ID = "202002502"
USER_PASS = "an2327557@"

# 기기 식별자 (아무 고유 문자열)
DEVICE_GUID = "test_device_guid_001"


# ──────────────────────────────────────────────
#  Sponge 암호화/복호화
#  (LCCommon.java에서 역공학)
# ──────────────────────────────────────────────

SPONGE_START = "AiZdoAGnNMyVmibRH"
SPONGE_STOP = "HvEDbxxKwrtyHTJLbxzu"
SPONGE_PAD = (
    "HvEDbxxKwrtyHTJLbxzuAiZdoAGnNMyVmibRH"
    "KwrtyHTJLbxzuAiZdoAGnAGnNMyVmibRHKwrtyH"
    "iZdoAGnNMyVmibRHKwrtyHTJLbxzuAiZdoAGnAGnNMy"
    "GnNMyVmibRHKwrtyHTJLbxzuAiZdoAGnAGn"
)


def sponge_encrypt(text: str) -> str:
    """Sponge 커스텀 암호화 (GetSpongeEncryptString 구현)"""
    if not text:
        return SPONGE_START + SPONGE_STOP

    reversed_text = text[::-1]
    result = ""

    for i, ch in enumerate(reversed_text):
        result += ch
        rand_pos = random.randint(0, 51)
        if i % 2 != 0:
            # 홀수 인덱스: 2글자 패딩
            result += SPONGE_PAD[rand_pos : rand_pos + 2]
        else:
            # 짝수 인덱스: 3글자 패딩
            result += SPONGE_PAD[rand_pos : rand_pos + 3]

    return SPONGE_START + result + SPONGE_STOP


def sponge_decrypt(text: str) -> str:
    """Sponge 커스텀 복호화 (GetSpongeDecryptString 구현)"""
    if not text or SPONGE_START not in text:
        return text

    inner = text.replace(SPONGE_START, "").replace(SPONGE_STOP, "")
    extracted = ""

    i = 0
    pos = 0
    while pos < len(inner) and i < 100:
        extracted += inner[pos]
        if i % 2 != 0:
            pos += 3  # 1(char) + 2(padding)
        else:
            pos += 4  # 1(char) + 3(padding)
        i += 1

    return extracted[::-1]


def url_encode(text: str) -> str:
    """UTF-8 URL 인코딩 (TxtEncodeer 구현)"""
    return urllib.parse.quote(text, safe="")


# ──────────────────────────────────────────────
#  User-Agent 생성
#  (LCCommon.SetUserAgent 구현)
# ──────────────────────────────────────────────

APP_VERSION = "1.0.0"  # 앱 버전 (필요 시 조정)


def build_user_agent() -> str:
    base_ua = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36"
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    encrypted_ts = sponge_encrypt(timestamp)
    return f"{base_ua} spongeapp{APP_VERSION} spongeandroid {encrypted_ts}"


# ──────────────────────────────────────────────
#  공통 HTTP 요청 헬퍼
# ──────────────────────────────────────────────

session = requests.Session()


def api_get(url: str, description: str, custom_headers: dict | None = None) -> dict | None:
    """GET 요청 후 JSON 파싱"""
    headers = custom_headers if custom_headers else {"User-Agent": build_user_agent()}

    print(f"\n{'─' * 60}")
    print(f"📡 [{description}]")
    print(f"   URL: {url[:120]}{'...' if len(url) > 120 else ''}")

    try:
        resp = session.get(url, headers=headers, timeout=15)
        print(f"   Status: {resp.status_code}")

        if resp.status_code == 200:
            try:
                data = resp.json()
                print(f"   Response: {json.dumps(data, ensure_ascii=False, indent=2)[:500]}")
                return data
            except json.JSONDecodeError:
                print(f"   ⚠️ JSON 파싱 실패. Raw: {resp.text[:300]}")
                return None
        else:
            print(f"   ❌ HTTP 에러: {resp.text[:300]}")
            return None
    except requests.RequestException as e:
        print(f"   ❌ 요청 실패: {e}")
        return None


# ──────────────────────────────────────────────
#  API 엔드포인트 함수들
# ──────────────────────────────────────────────

def step0_get_client_config() -> dict | None:
    """클라이언트 설정 조회 — Flag_Token_Secure, Return_Wifi_Mac_Address 등 확인"""
    url = f"{BASE_URL}/Clicker/GetClickerClientLibraryInformation"
    return api_get(url, "Step 0: 클라이언트 설정 조회")


def step1_login() -> dict | None:
    """로그인 (사용자 정보 확인)"""
    enc_id = url_encode(sponge_encrypt(USER_ID))
    enc_pw = url_encode(sponge_encrypt(USER_PASS))

    url = (
        f"{BASE_URL}/Clicker/GetMyInformation"
        f"?userid={enc_id}"
        f"&userpass={enc_pw}"
        f"&l_gubun="
        f"&login=true"
        f"&differentapp="
    )
    return api_get(url, "Step 1: 로그인 (사용자 정보 확인)")


def step2_get_reading_rooms(group_code: str = "") -> dict | None:
    """열람실 목록 조회"""
    url = f"{BASE_URL}/Clicker/GetClickerReadingRooms"
    if group_code:
        url += f"?groupcode={group_code}"
    return api_get(url, "Step 2: 열람실 목록 조회")


def step3_get_token() -> str:
    """Clicker 토큰 발급"""
    enc_guid = sponge_encrypt(DEVICE_GUID)
    url = (
        f"{BASE_URL}/Clicker/GetClickerToken"
        f"?UserId={USER_ID}"
        f"&Guid={url_encode(enc_guid)}"
    )
    data = api_get(url, "Step 3: 토큰 발급")
    if data and "l_token" in data:
        token = data["l_token"]
        return sponge_encrypt(token)
    return ""


def step4_beacon_action(
    major: str, minor: str, rssi: str,
    wifi_info: str = "", wifi_mac: str = "", token: str = ""
) -> dict | None:
    """비콘 인증"""
    enc_id = sponge_encrypt(USER_ID)
    enc_pw = url_encode(sponge_encrypt(USER_PASS))

    url = (
        f"{BASE_URL}/Beacon/DoClickerBeaconAction"
        f"?Uid=24ddf4118cf1440c87cde368daf9c93e"
        f"&Mac="
        f"&UserId={url_encode(enc_id)}"
        f"&UserPass={enc_pw}"
        f"&Name=RECO"
        f"&Major={major}"
        f"&Minor={minor}"
        f"&Rssi={rssi}"
        f"&Wifi={url_encode(wifi_info)}"
        f"&WifiMac={url_encode(wifi_mac)}"
        f"&Token={url_encode(token)}"
    )
    return api_get(url, "Step 4: 비콘 인증")


def step5_seat_action(
    seat_id: str, beacon_id: str = "",
    wifi_info: str = "", wifi_mac: str = "", token: str = ""
) -> dict | None:
    """좌석 배정"""
    enc_id = sponge_encrypt(USER_ID)
    enc_pw = url_encode(sponge_encrypt(USER_PASS))
    enc_guid = url_encode(sponge_encrypt(DEVICE_GUID))
    now = datetime.now().strftime("%Y%m%d%H%M%S")

    url = (
        f"{BASE_URL}/Clicker/UserSeatActionMobile/{seat_id}"
        f"?userid={url_encode(enc_id)}"
        f"&userpass={enc_pw}"
        f"&Beacon={url_encode(beacon_id)}"
        f"&devicename=android"
        f"&Guid={enc_guid}"
        f"&Wifi={url_encode(wifi_info)}"
        f"&WifiMac={url_encode(wifi_mac)}"
        f"&Token={url_encode(token)}"
        f"&RequestDateTime={now}"
    )
    return api_get(url, "Step 5: 좌석 배정")


def step_extend_seat(
    seat_id: str, beacon_id: str = "",
    wifi_info: str = "", wifi_mac: str = "", token: str = ""
) -> dict | None:
    """좌석 연장"""
    enc_id = url_encode(sponge_encrypt(USER_ID))
    enc_pw = url_encode(sponge_encrypt(USER_PASS))

    url = (
        f"{BASE_URL}/Clicker/ExtendReadingSeat"
        f"?strId={seat_id}"
        f"&strUserId={enc_id}"
        f"&strUserPass={enc_pw}"
        f"&strDeviceName=android"
        f"&strKiosk=false"
        f"&Wifi={url_encode(wifi_info)}"
        f"&Scanner="
        f"&Beacon={url_encode(beacon_id)}"
        f"&WifiMac={url_encode(wifi_mac)}"
        f"&Token={url_encode(token)}"
    )
    return api_get(url, "좌석 연장")


def step_release_seat(seat_id: str) -> dict | None:
    """좌석 반납"""
    enc_id = url_encode(sponge_encrypt(USER_ID))
    enc_pw = url_encode(sponge_encrypt(USER_PASS))

    url = (
        f"{BASE_URL}/Clicker/ReleaseReadingSeat"
        f"?SeatId={seat_id}"
        f"&userid={enc_id}"
        f"&userpass={enc_pw}"
        f"&devicename=android"
    )
    return api_get(url, "좌석 반납")


def step_book_study_room(
    room_id: str, date: str, start_time: str, duration: str, phone: str,
    person_count: str, subject: str, members: str
) -> dict | None:
    """스터디룸(그룹룸) 예약"""
    params = {
        "ClickerType": "1",
        "strRoomId": room_id,
        "strUserId": USER_ID,
        "strUserPass": USER_PASS,
        "strDeviceName": "desktop",
        "strDate": date,  # "2026-03-16"
        "strTime": start_time,  # "1800"
        "strDuration": duration,
        "strPhone": phone,
        "strPersonCount": person_count,
        "strSubject": subject,
        "strMembersJoin": members,
        "strNote": "",
        "strStaff": "",
        "strRequestAircon": "0",
        "strRequestStaff": "0",
        "strRequestProjector": "0",
        "strRequestPager": "0",
        "strCountMic": "0",
        "strCountWireLessMic": "0",
        "strEventType": "",
        "strHostingEvent": "",
        "SpaceSection": "",
        "strDurationHalf": "",
        "engMode": "False"
    }
    
    query = urllib.parse.urlencode(params)
    url = f"{BASE_URL}/Clicker/BookingPublicObjects?{query}"
    
    return api_get(url, "스터디룸 예약", {"User-Agent": "SpongeApp"})


def step_cancel_study_room(transaction_id: str) -> dict | None:
    """스터디룸 예약 취소"""
    url = f"{BASE_URL}/Clicker/GroupRoomUserCancel?TransactionId={transaction_id}"
    return api_get(url, "스터디룸 예약 취소", {"User-Agent": "SpongeApp"})


def step_extend_study_room(transaction_id: str) -> dict | None:
    """스터디룸 예약 연장"""
    url = f"{BASE_URL}/Clicker/SetStudyRoomBookTimeExtend?TransactionId={transaction_id}"
    return api_get(url, "스터디룸 예약 연장", {"User-Agent": "SpongeApp"})


# ──────────────────────────────────────────────
#  메인 실행 흐름
# ──────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  강남대 도서관 좌석 대여 API 시뮬레이션")
    print("=" * 60)

    if USER_ID == "여기에_학번_입력":
        print("\n⚠️  knulib_api.py 상단의 USER_ID / USER_PASS를 실제 값으로 변경하세요.")
        sys.exit(1)

    # ── Step 0: 클라이언트 설정 ──
    config = step0_get_client_config()

    # ── Step 1: 로그인 ──
    login_result = step1_login()
    if not login_result:
        print("\n❌ 로그인 실패. 종료합니다.")
        return

    status = login_result.get("l_communication_status", "")
    if status != "0":
        print(f"\n❌ 로그인 실패: status={status}")
        print(f"   → 아이디/비밀번호를 확인하세요.")
        return

    username = login_result.get("l_clicker_user_name", "?")
    print(f"\n✅ 로그인 성공! 이름: {username}")

    # ── Step 2: 열람실 목록 ──
    rooms_result = step2_get_reading_rooms()
    if not rooms_result:
        print("\n❌ 열람실 목록 조회 실패.")
        return

    rooms = rooms_result.get("_Model_lg_clicker_reading_room_brief_list", [])
    if not rooms:
        print("\n❌ 열람실 데이터가 비어 있습니다.")
        return

    print(f"\n📋 열람실 목록 ({len(rooms)}개):")
    print(f"   {'번호':<4} {'ID':<6} {'이름':<20} {'잔여석':<8} {'상태':<10} {'비콘필요'}")
    print(f"   {'─'*4} {'─'*6} {'─'*20} {'─'*8} {'─'*10} {'─'*8}")

    for idx, room in enumerate(rooms):
        rid = room.get("l_id", "?")
        name = room.get("l_room_name", "?")
        count = room.get("l_count", "?")
        mode = room.get("l_open_mode", "?")
        beacon_req = room.get("l_flag_beacon_validation", "?")
        print(f"   {idx:<4} {rid:<6} {name:<20} {count:<8} {mode:<10} {beacon_req}")

    # ── Step 3: 열람실 선택 ──
    print()
    choice = input("🪑 입장할 열람실 번호를 선택하세요 (숫자): ").strip()
    if not choice.isdigit() or int(choice) >= len(rooms):
        print("❌ 잘못된 입력입니다.")
        return

    selected = rooms[int(choice)]
    seat_id = selected["l_id"]
    room_name = selected["l_room_name"]
    beacon_required = selected.get("l_flag_beacon_validation", "false") == "true"
    group_code = selected.get("l_group_code", "")

    print(f"\n🏠 선택: {room_name} (ID: {seat_id})")
    print(f"   비콘 인증 필요: {'예' if beacon_required else '아니오'}")

    # ── Step 4: 토큰 발급 (선택적) ──
    token = ""
    # Flag_Token_Secure 설정에 따라 토큰 발급 시도
    if config and config.get("Flag_Token_Secure", "false") == "true":
        token = step3_get_token()

    # ── Step 5: 비콘 인증 (선택적) ──
    beacon_id = ""
    if beacon_required:
        print(f"\n⚠️  이 열람실은 비콘 인증이 필요합니다.")
        print(f"   실제 비콘 Major/Minor 값을 입력하거나, 빈 값으로 건너뛰세요.")
        major = input("   Major (빈 값=건너뛰기): ").strip()
        minor = input("   Minor (빈 값=건너뛰기): ").strip()

        if major and minor:
            beacon_result = step4_beacon_action(
                major=major, minor=minor, rssi="-65", token=token
            )
            if beacon_result:
                beacon_id = beacon_result.get("l_communication_beacon_id", "")
                b_status = beacon_result.get("l_communication_status", "")
                if b_status == "1":
                    print(f"\n✅ 비콘 인증 성공! beacon_id: {beacon_id}")
                else:
                    print(f"\n⚠️  비콘 인증 실패/미확인 (status={b_status})")
        else:
            print("   → 비콘 인증 건너뛰기 (WiFi fallback)")

    # ── Step 6: 좌석 배정 ──
    print(f"\n🎯 좌석 배정 요청을 전송합니다...")
    seat_result = step5_seat_action(
        seat_id=seat_id,
        beacon_id=beacon_id,
        token=token,
    )

    if seat_result:
        print(f"\n📄 좌석 배정 응답:")
        print(json.dumps(seat_result, ensure_ascii=False, indent=2))
    else:
        print("\n⚠️  좌석 배정 응답이 JSON이 아닐 수 있습니다 (WebView HTML 응답).")

    print(f"\n{'=' * 60}")
    print("  시뮬레이션 완료")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
