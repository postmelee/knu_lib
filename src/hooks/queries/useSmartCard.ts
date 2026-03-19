import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSmartCard, fetchQrId } from '../../services/userService';
import { getStoredSession } from '../../services/authService';
import { useAuthSession } from './useAuth';
import type { SmartCard } from '../../api/types/auth';

const SMART_CARD_KEY = ['smartCard'] as const;

/**
 * SmartCard 조회 훅
 * - enabled: 인증 세션이 존재할 때만 쿼리 실행
 * - 초기 로드: 서버에서 SmartCard 동기화
 * - fallback: API 실패 시 캐시된 세션에서 복원
 * - refreshQrId: qrId만 경량 조회
 */
export function useSmartCard() {
  const queryClient = useQueryClient();
  const { data: session } = useAuthSession();
  const hasSession = !!(session?.credentials?.id);

  const query = useQuery<SmartCard | null>({
    queryKey: SMART_CARD_KEY,
    queryFn: async () => {
      try {
        return await fetchSmartCard();
      } catch {
        // API 실패 시 캐시된 세션에서 폴백
        const stored = await getStoredSession();
        return stored?.smartCard ?? null;
      }
    },
    enabled: hasSession, // ← 세션 준비 전까지 쿼리 비활성화
    staleTime: Infinity,
  });

  /**
   * QR 새로고침: qrId만 서버에서 가져와 캐시의 qrId만 교체
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
