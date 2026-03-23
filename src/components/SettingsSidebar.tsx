import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Linking,
  Alert,
  Dimensions,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { textColors } from '../styles/typography';
import { useLogout } from '../hooks/queries/useAuth';

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.75;

interface SettingsSidebarProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const logoutMutation = useLogout();
  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  useEffect(() => {
    if (visible) {
      // 열기: 먼저 마운트한 뒤 애니메이션 시작
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          duration: 200,
          easing: Easing.inOut(Easing.quad)
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (shouldRender) {
      // 닫기: 애니메이션이 끝난 후에만 언마운트
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SIDEBAR_WIDTH,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad)
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible]);

  const handleLogout = () => {
    onClose();
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            logoutMutation.mutate(undefined, {
              onSuccess: () => router.replace('/login'),
            });
          },
        },
      ]
    );
  };

  const handleFeedback = () => {
    const email = process.env.EXPO_PUBLIC_FEEDBACK_EMAIL;
    const subject = encodeURIComponent(`[KNU Library App v${appVersion}] 건의사항`);
    const body = encodeURIComponent('\n\n---\n앱 버전: ' + appVersion);
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
    onClose();
  };

  if (!shouldRender) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* 반투명 오버레이 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.overlay,
            { opacity: overlayAnim },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* 사이드바 패널 */}
      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {/* 헤더 */}
        <View style={styles.sidebarHeader}>
          <Text preset="t4Bold" color={textColors.primary}>설정</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={24} color={textColors.secondary} />
          </TouchableOpacity>
        </View>

        {/* 메뉴 항목들 */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={handleFeedback}>
            <Ionicons name="mail-outline" size={22} color={textColors.primary} />
            <View style={styles.menuTextGroup}>
              <Text preset="t6Medium" color={textColors.primary}>건의사항 보내기</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#E53935" />
            <Text preset="t6Medium" color="#E53935">로그아웃</Text>
          </TouchableOpacity>
        </View>

        {/* 하단 버전 정보 */}
        <View style={styles.footer}>
          <Text preset="t8Medium" color={textColors.disabled}>KNU Library App</Text>
          <Text preset="t8Medium" color={textColors.disabled}>v{appVersion}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sidebar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F6',
  },
  menuSection: {
    gap: 4,
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F6',
  },
  menuTextGroup: {
    gap: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
    alignItems: 'center',
    gap: 2,
  },
});
