import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/Screen';
import Logo from '../src/components/Logo';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import { ErrorText, LinkText, Subtitle, Title } from '../src/components/Texts';
import { updatePassword } from '../src/services/auth';
import { colors } from '../src/theme';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await updatePassword(password, confirm);
      router.replace('/reset-success');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ marginTop: 40, marginBottom: 24 }}><Logo size={52} /></View>
      <Title>Crie uma nova senha</Title>
      <Subtitle>Escolha uma senha segura e diferente das que você já usou.</Subtitle>
      <ErrorText>{error}</ErrorText>
      <Input label="Nova senha" placeholder="Digite sua nova senha" password
        value={password} onChangeText={setPassword} />
      <Input label="Confirmar nova senha" placeholder="Digite novamente" password
        value={confirm} onChangeText={setConfirm} />
      <Button pill title="Redefinir senha" loadingTitle="Salvando..." loading={loading} onPress={onSubmit} />
      <View style={{ flex: 1 }} />
      <Pressable onPress={() => router.replace('/login')}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 48 }}>
        <Ionicons name="arrow-back" size={14} color={colors.primary} />
        <LinkText style={{ marginLeft: 6 }}>Voltar para o Login</LinkText>
      </Pressable>
    </Screen>
  );
}
