import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { login, getStoredSession, logout } from '../../services/authService';
import type { LoginCredentials, SmartCard } from '../../api/types/auth';

const AUTH_KEY = ['auth', 'session'] as const;

/**
 * 저장된 인증 세션을 확인하는 훅
 * 앱 시작 시 자동 로그인 판단에 사용
 */
export function useAuthSession() {
  return useQuery({
    queryKey: AUTH_KEY,
    queryFn: getStoredSession,
    staleTime: Infinity, // 수동 갱신만 허용
  });
}

/**
 * 로그인 뮤테이션 훅
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (_smartCard: SmartCard, credentials: LoginCredentials) => {
      // 세션 캐시 갱신
      queryClient.invalidateQueries({ queryKey: AUTH_KEY });
    },
  });
}

/**
 * 로그아웃 뮤테이션 훅
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_KEY, null);
    },
  });
}
