import { useQuery } from '@tanstack/react-query';
import { fetchUserProfile } from '../../services/userService';

// Queries
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserProfile(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
