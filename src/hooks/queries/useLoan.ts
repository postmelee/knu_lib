import { useQuery } from '@tanstack/react-query';
import { fetchRentalBooks } from '../../services/loanService';

const LOAN_KEY = ['loans', 'rentalBooks'] as const;

/**
 * 대출 도서 목록 조회 훅
 */
export function useRentalBooks() {
  return useQuery({
    queryKey: LOAN_KEY,
    queryFn: fetchRentalBooks,
    staleTime: 1000 * 60 * 5, // 5분
  });
}
