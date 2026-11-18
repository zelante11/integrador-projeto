import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import Screen from '../src/components/Screen';
import Logo from '../src/components/Logo';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import { ErrorText, LinkText, Subtitle, Title } from '../src/components/Texts';
import { login } from '../src/services/auth';
import { useData } from '../src/state/DataProvider';
import { colors, fonts } from '../src/theme';

export default function Login() {
  const { refresh } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      await refresh();
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ marginTop: 40, marginBottom: 24 }}><Logo size={52} /></View>
      <Title>Bem-vindo de volta!</Title>
      <Subtitle>Entre para continuar sua jornada.</Subtitle>
      <ErrorText>{error}</ErrorText>
      <Input label="E-mail" placeholder="Digite seu e-mail" keyboardType="email-address"
        value={email} onChangeText={setEmail} />
      <Input label="Senha" placeholder="Digite sua senha" password
        value={password} onChangeText={setPassword} />
      <LinkText style={{ alignSelf: 'flex-end', marginBottom: 28 }}
        onPress={() => router.push('/forgot-password')}>Esqueci minha senha</LinkText>
      <Button pill title="Entrar" loadingTitle="Entrando..." loading={loading} onPress={onSubmit} />
      <View style={{ alignItems: 'center', marginTop: 32 }}>
        <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginBottom: 6 }}>
          Ainda não tem uma conta?
        </Text>
        <LinkText onPress={() => router.push('/register')}>Criar minha conta</LinkText>
      </View>
    </Screen>
  );
}
