import { getMyInformation, getReadingRoomSeatsHTML, getReadingRooms, doBeaconAction, reserveSeat, extendSeat, releaseSeat } from '../api/seatApi';
import { UserState, SeatStatus, ParsedSeat, GetMyInfoResponse, ReadingRoom, BeaconAuthResponse, ActionResponse, SeatActionResponse } from '../api/types/seat';
import * as cheerio from 'cheerio';
import { getStoredSession } from './authService';

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
 * Resolves stored credentials; throws if no session exists.
 */
async function getCredentials() {
  const session = await getStoredSession();
  if (!session) throw new Error("No session found");
  return session.credentials;
}

/**
 * Fetches the current seat status and maps it to the domain SeatStatus object.
 * Credentials are auto-injected from the stored session.
 */
export async function fetchSeatStatus(): Promise<SeatStatus> {
  const { id, password } = await getCredentials();
  const data = await getMyInformation(id, password);
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
  const { id, password } = await getCredentials();
  const htmlStr = await getReadingRoomSeatsHTML(roomId, id, password);
  const $ = cheerio.load(htmlStr);
  const seats: ParsedSeat[] = [];

  // Scrape all elements with class 'clicker_s_o'
  $('.clicker_s_o').each((index, element) => {
    const el = $(element);
    
    // Extract onclick which contains "'seatId', 'isAllocated'"
    const onClickAttr = el.attr('onclick') || '';
    const clickParamsMatch = onClickAttr.match(/UserSeatMobile_Clicker\('([^']+)','([^']+)'\)/);
    
    // Extract positioning
    const styleAttr = el.attr('style') || '';
    const topMatch = styleAttr.match(/top\s*:\s*(\d+)px/);
    const leftMatch = styleAttr.match(/left\s*:\s*(\d+)px/);
    
    const displayNum = el.text().trim();
    const isOccupied = el.hasClass('clicker_l_allocated');

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
 * Beacon authentication — auto-injects credentials.
 */
export async function authenticateBeacon(): Promise<BeaconAuthResponse> {
  const { id, password } = await getCredentials();
  return await doBeaconAction(id, password);
}

/**
 * Reserve a specific seat — auto-injects credentials.
 */
export async function requestSeatReservation(seatId: string, beaconId: string = ''): Promise<ActionResponse> {
  const { id, password } = await getCredentials();
  return await reserveSeat(seatId, id, password, beaconId);
}

/**
 * Extend the current seat — auto-injects credentials.
 * Returns SeatActionResponse with l_communication_status/message.
 */
export async function requestSeatExtension(seatId: string, beaconId: string = ''): Promise<SeatActionResponse> {
  const { id, password } = await getCredentials();
  return await extendSeat(seatId, id, password, beaconId);
}

/**
 * Release/return the current seat — auto-injects credentials.
 * Returns SeatActionResponse with l_communication_status/message.
 */
export async function requestSeatRelease(seatId: string): Promise<SeatActionResponse> {
  const { id, password } = await getCredentials();
  return await releaseSeat(seatId, id, password);
}

