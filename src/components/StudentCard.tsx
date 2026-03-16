import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Text';
import { textColors } from '@/styles/typography';
import QRCode from 'react-native-qrcode-svg';
import { useSmartCard } from '@/hooks/queries/useSmartCard';

export function StudentCard() {
  const { data: smartCard, isLoading, refreshQrId } = useSmartCard();
  const [qrTimestamp, setQrTimestamp] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshQR = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshQrId();
      setQrTimestamp(new Date());
    } catch (error) {
      setQrTimestamp(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshQrId]);

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours() % 12 || 12).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? '오후' : '오전';
    return `${yyyy}년 ${MM}월 ${dd}일 ${ampm} ${hh}시 ${mm}분 ${ss}초`;
  };

  const qrValue = smartCard?.qrId || '';

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
        <View style={styles.userInfo}>
          <Text preset="t4Bold" color={textColors.primary} style={styles.nameSpacing}>
            {smartCard?.name ?? '—'}
          </Text>
          <Text preset="t6Medium" color={textColors.tertiary}>
            {smartCard?.id ?? '—'}
          </Text>
          <Text preset="t7Medium" color={textColors.tertiary}>
            {smartCard?.department ?? '—'}
          </Text>
          <Text preset="t7Medium" color={textColors.tertiary}>
            {smartCard?.college ?? '—'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.qrContainer}
          onPress={refreshQR}
          activeOpacity={0.7}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <View style={styles.qrLoading}>
              <ActivityIndicator size="small" color={textColors.blue} />
            </View>
          ) : qrValue ? (
            <QRCode
              value={qrValue}
              size={100}
              color={textColors.primary}
              backgroundColor="transparent"
            />
          ) : (
            <View style={styles.qrLoading}>
              <Text preset="t7Medium" color={textColors.tertiary}>QR 없음</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <Text preset="t8Medium" color={textColors.disabled} style={styles.timestamp}>
        {formatDate(qrTimestamp)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    paddingBottom: 10,
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
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
    paddingRight: 16,
    gap: 2,
  },
  nameSpacing: {
    marginBottom: 6,
  },
  qrContainer: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  qrLoading: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timestamp: {
    textAlign: 'center',
    marginTop: 10,
  },
});
