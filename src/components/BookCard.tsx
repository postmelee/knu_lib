import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { textColors } from '@/styles/typography';
import type { BookWithDDay } from '@/api/types/book';

interface BookCardProps {
  item: BookWithDDay;
  onExtend: () => void;
}

export const BookCard = ({ item, onExtend }: BookCardProps) => {
  const isRenewable = item.renewable !== '연기불가';
  
  let isOverdue = false;
  let isReturned = false;

  // 1. dDay를 우선 기준으로 상태 판별
  if (item.dDay < 0) {
    if (item.returnedStatus && item.returnedStatus.includes('연체')) {
      isOverdue = true;
    } else {
      isReturned = true;
    }
  } else {
    if (item.returnedStatus && item.returnedStatus.includes('반납')) {
      isReturned = true;
    }
  }

  // 2. 색상 규칙 적용
  let ddayBg = '#e8f3ff';     
  let ddayColor = '#3182f6';
  let ddayText = `D-${item.dDay}`;

  if (isReturned) {
    ddayBg = '#f2f4f6';
    ddayColor = '#4e5968';
    ddayText = '반납 완료';
  } else if (isOverdue || item.dDay <= 1) {
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
          <Text preset="t7Medium" color={textColors.secondary}>연장가능 횟수</Text>
          <Text preset="t7Bold" color={textColors.primary}>
            {item.renewCount === '해당없음' ? '0' : item.renewCount}
          </Text>
        </View>)}
      </View>

      {!isReturned && (
        <Button
          variant={isRenewable ? 'weak' : 'weak'}
          color={isRenewable ? 'primary' : 'dark'}
          size="large"
          onPress={onExtend}
          disabled={!isRenewable}
          style={styles.fullWidth}
        >
          {isRenewable ? '연장하기' : '연장 불가'}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
