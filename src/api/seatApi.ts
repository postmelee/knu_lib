import axios from 'axios';
import { spongeEncrypt, getSpongeTimestampString } from '../utils/crypto';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://lib.kangnam.ac.kr';
const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0'; // Update with actual version from ENV
const BASE_UA = 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36';

/**
 * Generates the strictly required User-Agent for bypass.
 */
const getRequiredUserAgent = () => {
  return `${BASE_UA} spongeapp${APP_VERSION} spongeandroid ${getSpongeTimestampString()}`;
};

const seatApiClient = axios.create({
  baseURL: BASE_URL,
});

seatApiClient.interceptors.request.use((config) => {
  config.headers['User-Agent'] = getRequiredUserAgent();
  return config;
});

// ============================================================================
// Types
// ============================================================================

import type { 
  GetMyInfoResponse, 
  ReadingRoom, 
  GetReadingRoomsResponse,
  BeaconAuthResponse, 
  SeatActionResponse 
} from './types/seat';

// ============================================================================
// APIs
// ============================================================================

/**
 * 2.1 State Evaluation API
 */
export const getMyInformation = async (id: string, pw: string): Promise<GetMyInfoResponse> => {
  const encId = encodeURIComponent(spongeEncrypt(id));
  const encPw = encodeURIComponent(spongeEncrypt(pw));
  
  const response = await seatApiClient.get<GetMyInfoResponse>(
    `/Clicker/GetMyInformation?userid=${encId}&userpass=${encPw}&l_gubun=1&login=false&differentapp=`
  );
  return response.data;
};

/**
 * 3.1 Fetching Rooms
 */
export const getReadingRooms = async (): Promise<ReadingRoom[]> => {
  const response = await seatApiClient.get<GetReadingRoomsResponse>('/Clicker/GetClickerReadingRooms');
  return response.data._Model_lg_clicker_reading_room_brief_list || [];
};

/**
 * 3.1.5 Fetch Reading Room Seats HTML (for parsing)
 */
export const getReadingRoomSeatsHTML = async (roomId: string, id: string, pw: string, guid: string = ''): Promise<string> => {
    const encId = encodeURIComponent(spongeEncrypt(id));
    const encPw = encodeURIComponent(spongeEncrypt(pw));
    // Notice the spec says we pass encrypted ID/PW to this HTML endpoint as well or plain? 
    // Looking at 4.userseatmobile.txt, userid and userpass look encrypted: `userid=AiZdo...`
    // We will use the encrypted ones.
    const response = await seatApiClient.get<string>(
      `/Clicker/UserSeatMobile/${roomId}?userid=${encId}&userpass=${encPw}&devicename=iphone&guid=${encodeURIComponent(guid)}&wifi=&Beacon=&wifimac=&token=&RequestDateTime=`
    );
    return response.data;
  };

/**
 * 3.2 Beacon Authentication
 * Major/Minor/RSSI come from actual BLE iBeacon scan.
 */
export const doBeaconAction = async (
  id: string, pw: string,
  major: number, minor: number, rssi: number,
  ssid: string = '', bssid: string = ''
): Promise<BeaconAuthResponse> => {
  const encId = encodeURIComponent(spongeEncrypt(id));
  const encPw = encodeURIComponent(spongeEncrypt(pw));
  
  const beaconUid = process.env.EXPO_PUBLIC_BEACON_UID || '24ddf4118cf1440c87cde368daf9c93e';
  
  const response = await seatApiClient.get<BeaconAuthResponse>(
    `/Beacon/DoClickerBeaconAction?Uid=${beaconUid}&UserId=${encId}&UserPass=${encPw}&Name=RECO&Major=${major}&Minor=${minor}&Rssi=${rssi}&Wifi=${encodeURIComponent(ssid)}&WifiMac=${encodeURIComponent(bssid)}`
  );
  return response.data;
};

/**
 * 3.3 Seat Reservation
 */
export const reserveSeat = async (seatId: string, id: string, pw: string, beaconId: string = '', guid: string = ''): Promise<SeatActionResponse> => {
  const encId = encodeURIComponent(spongeEncrypt(id));
  const encPw = encodeURIComponent(spongeEncrypt(pw));
  
  const response = await seatApiClient.get<SeatActionResponse>(
    `/Clicker/ReadingRoomAction?ActionCode=0&SeatId=${seatId}&UserId=${encId}&UserPass=${encPw}&DeviceName=android&Kiosk=false&Guid=${encodeURIComponent(guid)}&Wifi=&Scanner=&Geolocation=0&Beacon=${beaconId}&Eng=False`
  );
  return response.data;
};

/**
 * 3.4 Extending Seat
 */
export const extendSeat = async (seatId: string, id: string, pw: string, beaconId: string = ''): Promise<SeatActionResponse> => {
  const encId = encodeURIComponent(spongeEncrypt(id));
  const encPw = encodeURIComponent(spongeEncrypt(pw));
  
  const response = await seatApiClient.get<SeatActionResponse>(
    `/Clicker/ExtendReadingSeat?strId=${seatId}&strUserId=${encId}&strUserPass=${encPw}&strDeviceName=android&strKiosk=false&Wifi=&Scanner=&Beacon=${beaconId}`
  );
  return response.data;
};

/**
 * 3.5 Canceling/Releasing Seat
 */
export const releaseSeat = async (seatId: string, id: string, pw: string): Promise<SeatActionResponse> => {
  const encId = encodeURIComponent(spongeEncrypt(id));
  const encPw = encodeURIComponent(spongeEncrypt(pw));
  
  const response = await seatApiClient.get<SeatActionResponse>(
    `/Clicker/ReleaseReadingSeat?SeatId=${seatId}&userid=${encId}&userpass=${encPw}&devicename=android`
  );
  return response.data;
};
