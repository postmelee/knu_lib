import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { textColors } from '@/styles/typography';
import { useRouter } from 'expo-router';
import { useRentalBooks } from '@/hooks/queries/useLoan';

export function LoanSummaryCard() {
  const router = useRouter();
  const { data: books, isLoading } = useRentalBooks();

  const handleNavigateAll = () => {
    router.push('/loan-details');
  };

  const previewBooks = books?.slice(0, 3) ?? [];
  const totalCount = books?.length ?? 0;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={textColors.blue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text preset="t5Bold" color={textColors.primary}>대출 현황</Text>
          <Text preset="t5Bold" color={textColors.blue} style={styles.countSpacing}>{totalCount}</Text>
        </View>
        {totalCount > 0 && (
          <Button variant="weak" color="dark" size="small" onPress={handleNavigateAll}>전체보기 ›</Button>
        )}
      </View>

      {totalCount === 0 ? (
        <View style={styles.emptyState}>
          <Text preset="t7Medium" color={textColors.tertiary}>대출 중인 도서가 없습니다</Text>
        </View>
      ) : (
        <>
          <View style={styles.listContainer}>
            {previewBooks.map((book) => (
              <View key={book.num} style={styles.bookItem}>
                <View style={styles.bookInfo}>
                  <Text preset="t6Bold" color={textColors.primary} numberOfLines={1}>{book.name}</Text>
                  <Text preset="t7Regular" color={textColors.tertiary} style={styles.bookDateSpacing}>반납예정: {book.dueDate}</Text>
                </View>
                <View style={[
                  styles.ddayBadge,
                  book.dDay <= 3 ? styles.ddayRed : styles.ddayBlue,
                ]}>
                  <Text preset="t7Bold" color={book.dDay <= 3 ? textColors.red : textColors.blue}>
                    {book.dDay < 0 ? `D+${Math.abs(book.dDay)}` : `D-${book.dDay}`}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <Button variant="weak" color="primary" size="large" onPress={handleNavigateAll} style={styles.fullWidth}>
            도서 연장 신청하기
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countSpacing: {
    marginLeft: 6,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  listContainer: {
    marginBottom: 16,
    gap: 12,
  },
  bookItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 16,
  },
  bookInfo: {
    flex: 1,
  },
  bookDateSpacing: {
    marginTop: 2,
  },
  ddayBadge: {
    marginLeft: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ddayRed: {
    backgroundColor: '#ffecee',
  },
  ddayBlue: {
    backgroundColor: '#e8f3ff',
  },
  fullWidth: {
    width: '100%',
  },
});
