import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { Text } from '@/components/Text';
import { textColors } from '@/styles/typography';
import { StudentCard } from '@/components/StudentCard';
import { SeatStatusCard } from '@/components/SeatStatusCard';
import { LoanSummaryCard } from '@/components/LoanSummaryCard';
import { SettingsSidebar } from '@/components/SettingsSidebar';

export default function Home() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // PRD 3.5: 글로벌 당겨서 새로고침 — 모든 서버 데이터(QR, 좌석, 대출) 리페칭
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }, [queryClient]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text preset="t2Bold" color={textColors.primary}>강남대학교</Text>
          <TouchableOpacity 
            onPress={() => setSidebarVisible(true)} 
            style={styles.headerSpacer}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="menu" size={30} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.cardsContainer}>
          <StudentCard />
          <SeatStatusCard />
          <LoanSummaryCard />
        </View>
      </ScrollView>
      <SettingsSidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      <StatusBar style="dark" />
    </SafeAreaView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 22,
  },
  headerSpacer: {
    width: 32,
    alignItems: 'flex-end',
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
});
