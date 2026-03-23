import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
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
  const [isHistory, setIsHistory] = React.useState(false);
  const { data: books, isLoading, isError, refetch } = useRentalBooks(isHistory);

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
    
    let isOverdue = false;
    let isReturned = false;

    // 1. dDay를 우선 기준으로 상태 판별
    if (item.dDay < 0) {
      // 0 미만일 때: returnStatus를 이용해 실제 연체인지 과거에 반납된 것인지 구분
      if (item.returnedStatus && item.returnedStatus.includes('연체')) {
        isOverdue = true;
      } else {
        isReturned = true;
      }
    } else {
      // 0 이상일 때: 명시적인 반납이 아니면 모두 대출 중으로 판별 (수정 전 원리와 동일)
      if (item.returnedStatus && item.returnedStatus.includes('반납')) {
        isReturned = true;
      }
    }

    // 2. 색상 규칙 적용 (Button.tsx 토큰 기준)
    let ddayBg = '#e8f3ff';     // 기본: 파란색 계열
    let ddayColor = '#3182f6';
    let ddayText = `D-${item.dDay}`;

    if (isReturned) {
      // 반납 완료: 회색 계열 (Dark Weak)
      ddayBg = '#f2f4f6';
      ddayColor = '#4e5968';
      ddayText = '반납 완료';
    } else if (isOverdue || item.dDay <= 1) {
      // 연체 혹 하루 남음: 빨간색 계열 (Danger Weak)
      ddayBg = '#ffecee';
      ddayColor = '#f04452';
      ddayText = isOverdue ? `D+${Math.abs(item.dDay)}` : `D-${item.dDay}`;
    }

    return (
      <View style={styles.bookCard}>
        <View style={styles.bookHeader}>
          <Text preset="t5Bold" color={textColors.primary} numberOfLines={2} style={styles.bookNameFlex}>
            {item.name}
          </Text>
          <View style={[styles.ddayBadge, { backgroundColor: ddayBg }]}>
            <Text preset="t7Bold" style={{ color: ddayColor }}>
              {ddayText}
            </Text>
          </View>
        </View>

        <View style={styles.bookMeta}>
          <View style={styles.metaRow}>
            <Text preset="t7Medium" color={textColors.secondary}>대출일</Text>
            <Text preset="t7Bold" color={textColors.primary}>{item.rentalDate}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text preset="t7Medium" color={textColors.secondary}>반납예정</Text>
            <Text preset="t7Bold" color={textColors.primary}>{item.dueDate}</Text>
          </View>
           {!isReturned && (<View style={styles.metaRow}>
            <Text preset="t7Medium" color={textColors.secondary}>상태</Text>
            <Text preset="t7Bold" color={textColors.primary}>{item.returnedStatus}</Text>
          </View>)}
          {isReturned && (<View style={styles.metaRow}>
            <Text preset="t7Medium" color={textColors.secondary}>반납일</Text>
            <Text preset="t7Bold" color={textColors.primary}>{item.returnedDate}</Text>
          </View>)}
          {!isReturned && ( <View style={styles.metaRow}>
            <Text preset="t7Medium" color={textColors.secondary}>연장횟수</Text>
            <Text preset="t7Bold" color={textColors.primary}>
              {item.renewCount === '해당없음' ? '0' : item.renewCount}
            </Text>
          </View>)}
        </View>

        {/* 반납 완료 도서는 연장 버튼을 보일 필요 없음 */}
        {!isReturned && (
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
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 탭 네비게이션 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, !isHistory && styles.activeTab]}
          onPress={() => setIsHistory(false)}
        >
          <Text preset={!isHistory ? "t6Bold" : "t6Medium"} color={!isHistory ? textColors.primary : textColors.tertiary}>현재 대출 도서</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, isHistory && styles.activeTab]}
          onPress={() => setIsHistory(true)}
        >
          <Text preset={isHistory ? "t6Bold" : "t6Medium"} color={isHistory ? textColors.primary : textColors.tertiary}>전체 대출 기록</Text>
        </TouchableOpacity>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e8eb',
    paddingTop:2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'black',
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
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fullWidth: {
    marginTop: 16,
    width: '100%',
  },
});
