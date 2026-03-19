import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthSession } from './useAuth';
import type { GetMyInfoResponse } from '../../api/types/seat';
import { BeaconError, SeatActionError } from '../../utils/errors';
import { 
  fetchSeatStatus, 
  fetchReadingRooms, 
  fetchAndParseRoomSeats, 
  authenticateBeacon, 
  requestSeatReservation, 
  requestSeatExtension, 
  requestSeatRelease 
} from '../../services/seatService';

// Query Keys
export const SEAT_KEYS = {
  all: ['seat'] as const,
  info: () => [...SEAT_KEYS.all, 'info'] as const,
  rooms: () => [...SEAT_KEYS.all, 'rooms'] as const,
  roomSeats: (roomId: string) => [...SEAT_KEYS.all, 'roomSeats', roomId] as const,
};

// Global cached state for beacon ID
export let transientBeaconId = '';
export const setTransientBeaconId = (id: string) => { transientBeaconId = id; };

/**
 * 1. Seat Status Query (Evaluate State)
 *    Credentials are auto-injected by the service layer.
 */
export function useSeatState() {
    const { data: session } = useAuthSession();
    const hasCredentials = !!(session?.credentials?.id && session?.credentials?.password);

    return useQuery({
        queryKey: SEAT_KEYS.info(),
        queryFn: async () => {
            const seatStatus = await fetchSeatStatus();
            
            return {
                raw: seatStatus.raw,
                currentState: seatStatus.currentState,
                canExtend: seatStatus.raw?.g_clicker_l_flag_clicker_button_extend === "true"
            };
        },
        enabled: hasCredentials,
        staleTime: 1000 * 60,
        retry: 1,
    });
}

/**
 * 2. Reading Rooms Query
 */
export function useReadingRooms() {
    return useQuery({
        queryKey: SEAT_KEYS.rooms(),
        queryFn: fetchReadingRooms,
        staleTime: 1000 * 30,
    });
}

/**
 * 2.5 Reading Room Seats (HTML Parse)
 *     Credentials are auto-injected by the service layer.
 */
export function useReadingRoomSeats(roomId: string) {
    const { data: session } = useAuthSession();
    const hasCredentials = !!(session?.credentials?.id && session?.credentials?.password);

    return useQuery({
        queryKey: SEAT_KEYS.roomSeats(roomId),
        queryFn: async () => {
            return await fetchAndParseRoomSeats(roomId);
        },
        enabled: hasCredentials && !!roomId,
        staleTime: 1000 * 15,
    });
}

/**
 * 3. Beacon Auth Mutation
 */
export function useBeaconAuth() {
    return useMutation({
        mutationFn: async () => {
            const res = await authenticateBeacon();
            if (res.l_communication_status === "1" && res.l_communication_beacon_id) {
                setTransientBeaconId(res.l_communication_beacon_id);
                return res;
            } else {
                throw new BeaconError(res.l_communication_message || "Beacon verification failed");
            }
        }
    });
}

/**
 * 4. Reserve Seat Mutation
 */
export function useReserveSeat() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (seatId: string) => {
            const cachedState = queryClient.getQueryData<{ raw: GetMyInfoResponse | null }>(SEAT_KEYS.info());
            const needsBeacon = cachedState?.raw?.l_clicker_user_status_seat_beacon_use === true;

             // If beacon is required but we don't have a cached beacon ID, run BLE scan + auth
             let beaconId = transientBeaconId;
             if (needsBeacon && !beaconId) {
                 const authRes = await authenticateBeacon();
                 if (authRes.l_communication_status === "1" && authRes.l_communication_beacon_id) {
                     beaconId = authRes.l_communication_beacon_id;
                     setTransientBeaconId(beaconId);
                 } else {
                     throw new BeaconError(authRes.l_communication_message || '비콘 인증에 실패했습니다.');
                 }
             }

            const res = await requestSeatReservation(seatId, transientBeaconId);
            if (res.l_communication_status !== '0') {
                 const msg = (res.l_communication_message || '예약에 실패했습니다.')
                     .replace(/<br\s*\/?>/gi, '\n');
                 throw new SeatActionError(msg);
             }
             return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SEAT_KEYS.info() });
            queryClient.invalidateQueries({ queryKey: SEAT_KEYS.rooms() });
        }
    });
}

/**
 * 5. Extend Seat Mutation
 *    seatId is retrieved from cached seat state.
 */
export function useExtendSeat() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
             const cachedState = queryClient.getQueryData<{ raw: GetMyInfoResponse | null }>(SEAT_KEYS.info());
             const seatId = cachedState?.raw?.l_clicker_user_status_seat_id || '';
             const needsBeacon = cachedState?.raw?.l_clicker_user_status_seat_beacon_use === true;

             // If beacon is required but we don't have a cached beacon ID, run BLE scan + auth
             let beaconId = transientBeaconId;
             if (needsBeacon && !beaconId) {
                 const authRes = await authenticateBeacon();
                 if (authRes.l_communication_status === "1" && authRes.l_communication_beacon_id) {
                     beaconId = authRes.l_communication_beacon_id;
                     setTransientBeaconId(beaconId);
                 } else {
                     throw new BeaconError(authRes.l_communication_message || '비콘 인증에 실패했습니다.');
                 }
             }

             const res = await requestSeatExtension(seatId, beaconId);
             if (res.l_communication_status !== '0') {
                 const msg = (res.l_communication_message || '연장에 실패했습니다.')
                     .replace(/<br\s*\/?>/gi, '\n');
                 throw new SeatActionError(msg);
             }
             return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SEAT_KEYS.info() });
        }
    });
}

/**
 * 6. Release Seat Mutation
 *    seatId is retrieved from cached seat state.
 */
export function useReleaseSeat() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
             // Get current seatId from cached query data
             const cachedState = queryClient.getQueryData<{ raw: GetMyInfoResponse | null }>(SEAT_KEYS.info());
             const seatId = cachedState?.raw?.l_clicker_user_status_seat_id || '';
             const res = await requestSeatRelease(seatId);
             // Server signals failure via l_communication_status !== "0"
             if (res.l_communication_status !== '0') {
                 const msg = (res.l_communication_message || '퇴실에 실패했습니다.')
                     .replace(/<br\s*\/?>/gi, '\n');
                 throw new SeatActionError(msg);
             }
             return res;
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: SEAT_KEYS.info() });
             queryClient.invalidateQueries({ queryKey: SEAT_KEYS.rooms() });
             setTransientBeaconId('');
        }
    });
}
