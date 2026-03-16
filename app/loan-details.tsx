import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { textColors } from '@/styles/typography';
import { useRentalBooks } from '@/hooks/queries/useLoan';
import type { BookWithDDay } from '@/api/types/book';

export default function LoanDetailsScreen() {
  const router = useRouter();
  const { data: books, isLoading, isError, refetch } = useRentalBooks();

  const handleExtend = (book: BookWithDDay) => {
    if (book.renewable !== '가능') {
      Alert.alert('연장 불가', '해당 도서는 현재 연장할 수 없습니다.', [{ text: '확인' }]);
      return;
    }
    Alert.alert('연장 요청', `"${book.name}" 연장을 요청하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { text: '연장', onPress: () => { /* extend API */ } },
    ]);
  };

  const renderBook = ({ item }: { item: BookWithDDay }) => {
    const isRenewable = item.renewable === '가능';
    const isOverdue = item.dDay < 0;

    const ddayColor = isOverdue ? '#f04452' : item.dDay <= 3 ? '#ea580c' : textColors.secondary;
    const ddayBg = isOverdue ? '#ffecee' : item.dDay <= 3 ? '#fff7ed' : '#f2f4f6';

    return (
      <View style={styles.bookCard}>
        <View style={styles.bookHeader}>
          <Text preset="t5Bold" color={textColors.primary} numberOfLines={2} style={styles.bookNameFlex}>
            {item.name}
          </Text>
          <View style={[styles.ddayBadge, { backgroundColor: ddayBg }]}>
            <Text preset="t7Bold" color={ddayColor}>
              {isOverdue ? `D+${Math.abs(item.dDay)}` : `D-${item.dDay}`}
            </Text>
          </View>
        </View>

        <View style={styles.bookMeta}>
          <View style={styles.metaRow}>
            <Text preset="t7Medium" color={textColors.tertiary}>대출일</Text>
            <Text preset="t7Bold" color={textColors.primary}>{item.rentalDate}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text preset="t7Medium" color={textColors.tertiary}>반납예정</Text>
            <Text preset="t7Bold" color={textColors.primary}>{item.dueDate}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text preset="t7Medium" color={textColors.tertiary}>상태</Text>
            <Text preset="t7Bold" color={textColors.primary}>{item.returnedStatus}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text preset="t7Medium" color={textColors.tertiary}>연장횟수</Text>
            <Text preset="t7Bold" color={textColors.primary}>
              {item.renewCount === '해당없음' ? '0' : item.renewCount}회
            </Text>
          </View>
        </View>

        <Button
          variant={isRenewable ? 'weak' : 'weak'}
          color={isRenewable ? 'primary' : 'dark'}
          size="large"
          onPress={() => handleExtend(item)}
          disabled={!isRenewable}
          style={styles.fullWidth}
        >
          {isRenewable ? '연장하기' : '연장 불가'}
        </Button>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Button variant="weak" color="primary" size="small" onPress={() => router.back()}>← 돌아가기</Button>
        <Text preset="t5Bold" color={textColors.primary}>전체 대출 현황</Text>
        <View style={styles.headerRight} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={textColors.blue} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text preset="t6Medium" color={textColors.secondary} style={styles.errorSpacing}>
            대출 정보를 불러오지 못했습니다
          </Text>
          <Button variant="fill" color="primary" size="medium" onPress={() => refetch()}>다시 시도</Button>
        </View>
      ) : books && books.length === 0 ? (
        <View style={styles.center}>
          <Text preset="t6Medium" color={textColors.tertiary}>대출 중인 도서가 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.num}
          renderItem={renderBook}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerRight: {
    width: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorSpacing: {
    marginBottom: 16,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 48,
  },
  bookCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bookNameFlex: {
    flex: 1,
    marginRight: 12,
  },
  ddayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookMeta: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fullWidth: {
    width: '100%',
  },
});
