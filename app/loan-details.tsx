import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { textColors } from '@/styles/typography';
import { useRentalBooks, useExtendDialog } from '@/hooks/queries/useLoan';
import { BookCard } from '@/components/BookCard';

export default function LoanDetailsScreen() {
  const router = useRouter();
  const [isHistory, setIsHistory] = React.useState(false);
  const { data: books, isLoading, isError, refetch } = useRentalBooks(isHistory);
  const { handleExtendDialog } = useExtendDialog();

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
          renderItem={({ item }) => (
            <BookCard item={item} onExtend={() => handleExtendDialog(item)} />
          )}
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
    paddingTop: 2,
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
});
