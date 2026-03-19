import { getMyInformation, getReadingRoomSeatsHTML, getReadingRooms, doBeaconAction, reserveSeat, extendSeat, releaseSeat } from '../api/seatApi';
import { UserState, SeatStatus, ParsedSeat, GetMyInfoResponse, ReadingRoom, BeaconAuthResponse, SeatActionResponse } from '../api/types/seat';
import * as cheerio from 'cheerio';
import { getStoredSession } from './authService';
import { scanForKNUBeacon } from './beaconService';

// TODO: Set to false before production release
const IS_MOCK_BEACON = true;

/**
 * Helper to determine the UserState from raw GetMyInfoResponse
 */
function determineUserState(response: GetMyInfoResponse): UserState {
  // l_communication_status === "0" means SUCCESS (authenticated)
  // Any other value means authentication failed
  if (response.l_communication_status !== '0') {
    return UserState.UNAUTHORIZED;
  }

  // Authenticated — now check seat status
  if (response.l_clicker_user_status_seat_id && response.l_clicker_user_status_seat_id !== '') {
    if (response.l_clicker_user_status_open === '0') {
      return UserState.AWAY;
    }
    return UserState.SEATED;
  }
  
  return UserState.IDLE;
}

/**
 * Resolves stored credentials and guid; throws if no session exists.
 */
async function getSessionData() {
  const session = await getStoredSession();
  if (!session) throw new Error("No session found");
  return {
    credentials: session.credentials,
    guid: session.smartCard.guid
  };
}

/**
 * Fetches the current seat status and maps it to the domain SeatStatus object.
 * Credentials are auto-injected from the stored session.
 */
export async function fetchSeatStatus(): Promise<SeatStatus> {
  const { credentials } = await getSessionData();
  const data = await getMyInformation(credentials.id, credentials.password);
  const state = determineUserState(data);
  return {
    currentState: state,
    raw: data,
  };
}

/**
 * Fetches HTML from the UserSeatMobile endpoint and parses the 2D layout map.
 * Credentials are auto-injected from the stored session.
 */
export async function fetchAndParseRoomSeats(roomId: string): Promise<ParsedSeat[]> {
  const { credentials, guid } = await getSessionData();
  const htmlStr = await getReadingRoomSeatsHTML(roomId, credentials.id, credentials.password, guid);
  const $ = cheerio.load(htmlStr);
  const seats: ParsedSeat[] = [];

  // Scrape all elements with class 'clicker_s_o'
  $('.clicker_s_o').each((index, element) => {
    const el = $(element);
    
    // Extract onclick which contains "doReadingSeatClicked('seatId', 'isAllocated')"
    const onClickAttr = el.attr('onclick') || '';
    const clickParamsMatch = onClickAttr.match(/doReadingSeatClicked\(\s*'([^']+)'/);
    
    // Extract positioning
    const styleAttr = el.attr('style') || '';
    const topMatch = styleAttr.match(/top\s*:\s*(\d+)px/);
    const leftMatch = styleAttr.match(/left\s*:\s*(\d+)px/);
    
    const displayNum = el.text().trim();
    const isOccupied = el.attr('title') !== '배정가능';

    if (clickParamsMatch && topMatch && leftMatch) {
      const seatIdHex = clickParamsMatch[1];
      const topPos = parseInt(topMatch[1], 10);
      const leftPos = parseInt(leftMatch[1], 10);

      seats.push({
        id: seatIdHex,
        number: displayNum,
        isOccupied: isOccupied,
        top: topPos,
        left: leftPos,
      });
    }
  });

  return seats;
}

/**
 * Fetches reading room list (no auth required).
 */
export async function fetchReadingRooms(): Promise<ReadingRoom[]> {
  return await getReadingRooms();
}

/**
 * Beacon authentication — scans for BLE iBeacon then authenticates with server.
 * Auto-injects credentials from stored session.
 */
export async function authenticateBeacon(): Promise<BeaconAuthResponse> {
  if (IS_MOCK_BEACON) {
    // Return mock successful response based on docs/mitlogs/6.doclickerbeaconaction.txt
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                l_communication_status: "1",
                l_communication_beacon_id: "24ddf4118cf1440c87cde368daf9c93e-10001-122",
                l_communication_clicker_id: "",
                l_communication_clicker_roomname: "강남대학교 중앙도서관",
                l_communication_clicker_type: "5",
                l_communication_clicker_group_code: "20180422143616998",
                l_communication_clicker_group_roomname: "중앙도서관",
                l_communication_on_seat: "0",
                l_communication_task: "g",
                l_communication_message: " 비콘이 확인 되었습니다.",
                l_communication_sub_type: "7"
            } as BeaconAuthResponse);
        }, 1500); // Simulate network/scan delay of 1.5s
    });
  }

  const { credentials } = await getSessionData();
  const beacon = await scanForKNUBeacon(); // BLE scan → Major/Minor/RSSI
  return await doBeaconAction(credentials.id, credentials.password, beacon.major, beacon.minor, beacon.rssi);
}

/**
 * Reserve a specific seat — auto-injects credentials and GUID.
 */
export async function requestSeatReservation(seatId: string, beaconId: string = ''): Promise<SeatActionResponse> {
  const { credentials, guid } = await getSessionData();
  return await reserveSeat(seatId, credentials.id, credentials.password, beaconId, guid);
}

/**
 * Extend the current seat — auto-injects credentials.
 * Returns SeatActionResponse with l_communication_status/message.
 */
export async function requestSeatExtension(seatId: string, beaconId: string = ''): Promise<SeatActionResponse> {
  const { credentials } = await getSessionData();
  return await extendSeat(seatId, credentials.id, credentials.password, beaconId);
}

/**
 * Release/return the current seat — auto-injects credentials.
 * Returns SeatActionResponse with l_communication_status/message.
 */
export async function requestSeatRelease(seatId: string): Promise<SeatActionResponse> {
  const { credentials } = await getSessionData();
  return await releaseSeat(seatId, credentials.id, credentials.password);
}

