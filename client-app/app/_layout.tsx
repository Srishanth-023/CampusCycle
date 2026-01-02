import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#0A0A0A" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0A' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            title: 'Login'
          }} 
        />
      </Stack>
    </>
  );
}
