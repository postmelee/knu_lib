import { useQuery } from '@tanstack/react-query';
import { fetchRentalBooks } from '../../services/loanService';

const LOAN_KEY = ['loans', 'rentalBooks'] as const;

/**
 * 대출 도서 목록 조회 훅
 */
export function useRentalBooks(isHistory: boolean = false) {
  return useQuery({
    queryKey: ['loans', 'rentalBooks', isHistory],
    queryFn: async () => {
      const data = await fetchRentalBooks(isHistory);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
}
