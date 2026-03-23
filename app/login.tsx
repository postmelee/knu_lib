import { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { textColors } from '@/styles/typography';
import { useLogin } from '@/hooks/queries/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const loginMutation = useLogin();

  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  const isFormValid = studentId.trim().length > 0 && password.trim().length > 0;

  const handleLogin = () => {
    if (!isFormValid) return;

    loginMutation.mutate(
      { id: studentId.trim(), password: password.trim() },
      {
        onSuccess: () => {
          router.replace('/');
        },
        onError: (error: Error) => {
          const title = error.name === 'NetworkError' ? '네트워크 오류' : '로그인 실패';
          Alert.alert(
            title,
            error.message,
            [{ text: '확인' }],
          );
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text preset="t2Bold" color={textColors.primary} style={styles.titleSpacing}>강남대학교 도서관</Text>
            <Text preset="t6Medium" color={textColors.secondary}>학번과 비밀번호로 로그인하세요</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text preset="t7Bold" color={textColors.secondary} style={styles.labelSpacing}>학번</Text>
              <TextInput
                style={styles.input}
                placeholder="학번을 입력하세요"
                placeholderTextColor="#9ca3af"
                value={studentId}
                onChangeText={setStudentId}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                editable={!loginMutation.isPending}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text preset="t7Bold" color={textColors.secondary} style={styles.labelSpacing}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                editable={!loginMutation.isPending}
              />
            </View>

            <Button
              variant="fill"
              color="primary"
              size="xlarge"
              onPress={handleLogin}
              disabled={!isFormValid || loginMutation.isPending}
              loading={loginMutation.isPending}
              style={styles.loginButtonSpacing}
            >
              로그인
            </Button>
          </View>
        </View>
      </ScrollView>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    paddingTop: '35%',
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleSpacing: {
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  labelSpacing: {
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#191f28',
    fontFamily: 'Pretendard-Regular',
  },
  loginButtonSpacing: {
    marginTop: 8,
    width: '100%',
  },
});
