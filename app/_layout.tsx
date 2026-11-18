import { useEffect } from 'react';
import { Stack, router, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import {
  Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { colors } from '../src/theme';
import { AuthProvider, useAuth } from '../src/state/AuthProvider';
import { DataProvider, useDataStatus } from '../src/state/DataProvider';

function Navigator() {
  const { session, ready, recovery, clearRecovery } = useAuth();
  const { loaded, data } = useDataStatus();
  const navReady = !!useRootNavigationState()?.key;

  // Abriu o link de "esqueci minha senha": leva para a tela de nova senha.
  useEffect(() => {
    if (recovery && ready && navReady) {
      clearRecovery();
      router.replace('/reset-password');
    }
  }, [recovery, ready, navReady, clearRecovery]);

  if (!ready) return null;

  const signedIn = !!session;
  const completed = !!data?.profile.onboardingCompleted;

  // Cada grupo só fica acessível no estado certo: o router redireciona sozinho quando o estado muda.
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register-success" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="reset-success" />

      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
      </Stack.Protected>

      <Stack.Protected guard={signedIn && loaded && !completed}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      <Stack.Protected guard={signedIn && loaded && completed}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="plano/[slug]" />
        <Stack.Screen name="exercicio/[id]" />
        <Stack.Screen name="treino" />
        <Stack.Screen name="historico" />
        <Stack.Screen name="coach" />
        <Stack.Screen name="configuracoes" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    BarlowCondensed_700Bold, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
  });
  if (!loaded) return null;
  return (
    <AuthProvider>
      <DataProvider>
        <StatusBar style="dark" />
        <Navigator />
      </DataProvider>
    </AuthProvider>
  );
}
