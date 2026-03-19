import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { useCallback, useState } from 'react';
import { Text } from '@/components/Text';
import { textColors } from '@/styles/typography';
import { StudentCard } from '@/components/StudentCard';
import { SeatStatusCard } from '@/components/SeatStatusCard';
import { LoanSummaryCard } from '@/components/LoanSummaryCard';

export default function Home() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text preset="t2Bold" color={textColors.primary}>강남대학교</Text>
        </View>
        <View style={styles.cardsContainer}>
          <StudentCard />
          <SeatStatusCard />
          <LoanSummaryCard />
        </View>
      </ScrollView>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // gray-50
  },
  scrollContent: {
    paddingBottom: 48,
  },
  header: {
    paddingTop: 64, // Status bar offset
    paddingBottom: 16,
    alignItems: 'center',
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
});
