import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSmartCard, fetchQrId } from '../../services/userService';
import { getStoredSession } from '../../services/authService';
import type { SmartCard } from '../../api/types/auth';

const SMART_CARD_KEY = ['smartCard'] as const;

/**
 * SmartCard 조회 훅
 * - 초기 로드: 세션에서 SmartCard 가져온 뒤, 백그라운드에서 1회 전체 동기화
 * - refreshQrId 호출 시: qrId만 경량 조회 (AsyncStorage 쓰기 없음)
 */
export function useSmartCard() {
  const queryClient = useQueryClient();

  const query = useQuery<SmartCard | null>({
    queryKey: SMART_CARD_KEY,
    queryFn: async () => {
      // 앱 시작 시 전체 SmartCard 동기화 (세션 저장 포함)
      try {
        return await fetchSmartCard();
      } catch {
        // API 실패 시 캐시된 세션에서 폴백
        const session = await getStoredSession();
        return session?.smartCard ?? null;
      }
    },
    staleTime: Infinity,
  });

  /**
   * QR 새로고침: qrId만 서버에서 가져와 캐시의 qrId만 교체
   * AsyncStorage 쓰기 없이 메모리(React Query 캐시)만 업데이트
   */
  const refreshQrId = async () => {
    const newQrId = await fetchQrId();
    queryClient.setQueryData<SmartCard | null>(SMART_CARD_KEY, (old) => {
      if (!old) return old;
      return { ...old, qrId: newQrId };
    });
    return newQrId;
  };

  return {
    ...query,
    refreshQrId,
  };
}
