import { Stack, SplashScreen, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { useAuthSession } from '@/hooks/queries/useAuth';
import { textColors } from '@/styles/typography';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { data: session, isLoading } = useAuthSession();

  useEffect(() => {
    if (isLoading) return;

    const isOnLoginPage = segments[0] === 'login';
    const isLoggedIn = session != null;

    if (!isLoggedIn && !isOnLoginPage) {
      // 로그인되지 않았으면 로그인 화면으로
      router.replace('/login');
    } else if (isLoggedIn && isOnLoginPage) {
      // 이미 로그인 상태면 홈으로
      router.replace('/');
    }
  }, [session, isLoading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  // Ensure the query client is stable between re-renders
  const [queryClient] = useState(() => new QueryClient());
  
  const [loaded] = useFonts({
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="loan-details" options={{ 
                    headerShown: true,
                    title: '대출 목록', // Dynamic title will be set in the screen
                    headerBackTitle: '뒤로',
                    headerTintColor: textColors.primary,
                    headerTitleStyle: {
                      fontFamily: 'Pretendard-Medium',
                      fontSize: 18,
                    },
                    headerShadowVisible: false,
                  }}  />
        </Stack>
      </AuthGate>
    </QueryClientProvider>
  );
}
