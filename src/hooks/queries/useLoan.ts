import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRentalBooks, extendRentalBook } from '../../services/loanService';
import { Alert } from 'react-native';
import type { BookWithDDay } from '../../api/types/book';

export const LOAN_KEY = ['loans', 'rentalBooks'] as const;

/**
 * 대출 도서 목록 조회 훅
 */
export function useRentalBooks(isHistory: boolean = false) {
  return useQuery({
    queryKey: [...LOAN_KEY, isHistory],
    queryFn: async () => {
      const data = await fetchRentalBooks(isHistory);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * 도서 연장 API Mutation Hook (순수 데이터 통신)
 */
export function useRenewBookMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bookId: string) => extendRentalBook(bookId),
    onSuccess: () => {
      // 연장 성공 시 대출 목록 새로고침
      queryClient.invalidateQueries({ queryKey: LOAN_KEY });
      Alert.alert('연장 완료', '도서 대출 기한이 연장되었습니다.', [{ text: '확인' }]);
    },
    onError: (error) => {
      Alert.alert('연장 실패', error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.');
    }
  });
}

/**
 * 도서 연장 비즈니스 로직(검증 및 다이얼로그) Hook (UI 제어)
 */
export function useExtendDialog() {
  const renewBook = useRenewBookMutation();

  const handleExtendDialog = (book: BookWithDDay) => {
    if (book.renewable !== '연기') {
      Alert.alert('연장 불가', '해당 도서는 현재 연장할 수 없습니다.', [{ text: '확인' }]);
      return;
    }

    // 당일 대출 여부 판별
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDate = String(today.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDate}`;
    
    // rentalDate 형식이 "YYYY-MM-DD" 또는 "YYYY.MM.DD" 둘 다 안전하게 비교하도록 통일
    const rentalStr = book.rentalDate.replace(/\./g, '-');

    if (rentalStr === todayStr) {
      Alert.alert('연장 불가', '당일 대출한 도서는 연장이 불가능합니다.', [{ text: '확인' }]);
      return;
    }

    // 반납예정일 1주일 이내(dDay <= 7)인지 판별
    if (book.dDay > 7) {
      const due = new Date(book.dueDate.replace(/\./g, '-'));
      due.setDate(due.getDate() - 7);
      const year = due.getFullYear();
      const month = String(due.getMonth() + 1).padStart(2, '0');
      const date = String(due.getDate()).padStart(2, '0');
      
      Alert.alert(
        '연장 불가',
        `대출연장은 반납 1주일 전 (${year}.${month}.${date}) 부터 가능합니다.`,
        [{ text: '확인' }]
      );
      return;
    }

    // 연기 후 새로운 반납예정일 (현재일 기준 1주일 후)
    const newDue = new Date();
    newDue.setDate(newDue.getDate() + 7);
    const newDueYear = newDue.getFullYear();
    const newDueMonth = String(newDue.getMonth() + 1).padStart(2, '0');
    const newDueDate = String(newDue.getDate()).padStart(2, '0');
    const newDueStr = `${newDueYear}.${newDueMonth}.${newDueDate}`;

    Alert.alert(
      '연기 신청', 
      `반납예정일이 ${newDueStr}로 연기됩니다.\n'${book.name}' 도서를 연기할까요?`, 
      [
        { text: '취소', style: 'destructive' },
        { 
          text: '연기하기', 
          onPress: () => {
            if (!book.id) {
              Alert.alert('오류', '도서 ID를 찾을 수 없어 연장할 수 없습니다.');
              return;
            }
            renewBook.mutate(book.id);
          }
        },
      ]
    );
  };

  return { handleExtendDialog, isPending: renewBook.isPending };
}
