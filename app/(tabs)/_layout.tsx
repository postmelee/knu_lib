import { Stack } from 'expo-router';
import { textColors } from '@/styles/typography';

export default function TabsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="rooms" 
        options={{ 
          headerShown: true,
          title: '열람실 목록',
          headerBackTitle: '뒤로',
          headerTintColor: textColors.primary,
          headerTitleStyle: {
            fontFamily: 'Pretendard-Medium',
            fontSize: 18,
          },
          headerShadowVisible: false,
        }} 
      />
      <Stack.Screen 
        name="seat-reservation" 
        options={{ 
          headerShown: true,
          title: '', // Dynamic title will be set in the screen
          headerBackTitle: '뒤로',
          headerTintColor: textColors.primary,
          headerTitleStyle: {
            fontFamily: 'Pretendard-Medium',
            fontSize: 18,
          },
          headerShadowVisible: false,
        }} 
      />
    </Stack>
  );
}
