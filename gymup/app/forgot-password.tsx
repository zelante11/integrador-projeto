import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/Screen';
import Logo from '../src/components/Logo';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import { ErrorText, LinkText, Subtitle, Title } from '../src/components/Texts';
import { requestPasswordReset } from '../src/services/auth';
import { colors } from '../src/theme';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      // Com Supabase, o link do e-mail abre a tela reset-password.
      router.push('/reset-password');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ marginTop: 40, marginBottom: 24 }}><Logo size={52} /></View>
      <Title>Redefinir senha</Title>
      <Subtitle>Informe o e-mail da sua conta e enviaremos as instruções para criar uma nova senha.</Subtitle>
      <ErrorText>{error}</ErrorText>
      <Input label="E-mail" placeholder="Digite seu e-mail" keyboardType="email-address"
        value={email} onChangeText={setEmail} />
      <Button pill title="Solicitar recuperação" loadingTitle="Enviando..." loading={loading} onPress={onSubmit} />
      <View style={{ flex: 1 }} />
      <Pressable onPress={() => router.replace('/login')}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 48 }}>
        <Ionicons name="arrow-back" size={14} color={colors.primary} />
        <LinkText style={{ marginLeft: 6 }}>Voltar para o Login</LinkText>
      </Pressable>
    </Screen>
  );
}
