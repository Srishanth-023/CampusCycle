import { Stack } from 'expo-router';
import LoginScreen from './LoginScreen';

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LoginScreen />
    </>
  );
}
