export interface GetMyInfoResponse {
  l_communication_status: string;
  g_clicker_user_clicker_count: string;
  l_clicker_user_status_open: string;
  
  // User info
  l_clicker_user_name?: string;
  l_clicker_user_id?: string;
  l_clicker_user_depart_name?: string;
  l_clicker_user_levelname?: string;
  l_clicker_user_status?: string;

  // Seated Context
  l_clicker_user_status_seat_id?: string;
  l_clicker_user_status_seat_room_name?: string;
  l_clicker_user_status_seat_number?: string;
  l_clicker_user_status_seat_time_start?: string;
  l_clicker_user_status_seat_time_stop?: string;
  l_clicker_user_status_seat_beacon_use?: boolean;
  g_clicker_l_flag_clicker_button_extend?: string;
  
  // Re-reservation
  g_clicker_user_l_favorite_seat_id?: string;
  g_clicker_user_l_before_seat_id?: string;
  
  // Flags
  g_clicker_l_flag_beacon?: string;
  g_clicker_l_flag_repeat_cancel_seat?: string;
  g_clicker_l_repeat_cancel_seat_message?: string;
}

export interface ReadingRoom {
  l_id: string;
  l_room_name: string;
  l_count: number;
  l_occupied: number;
  l_flag_beacon_validation: number | string; // Expected: 1 for true, 0 for false
}

export interface BeaconAuthResponse {
  l_communication_status: string;
  l_communication_beacon_id: string;
  l_communication_message: string;
}

export interface ActionResponse {
  g_clicker_login_result: number;
  clicker_global_book_error_message: string;
  UserInfo?: any[];
}

/**
 * Response from ExtendReadingSeat / ReleaseReadingSeat.
 * These endpoints return a full info blob with l_communication_status/message.
 */
export interface SeatActionResponse {
  l_communication_status: string;
  l_communication_message: string | null;
}

export enum UserState {
  UNAUTHORIZED = 0,
  IDLE = 1,
  SEATED = 2,
  AWAY = 3
}

export interface ParsedSeat {
  id: string;             // The long tracking ID
  number: string;         // The display number e.g., '42'
  isOccupied: boolean;    // false = Available, true = In Use
  left: number;           // Absolute positioning from HTML
  top: number;            // Absolute positioning from HTML
}

export interface SeatStatus {
  currentState: UserState;
  raw: GetMyInfoResponse | null;
}
