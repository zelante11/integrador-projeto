import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/Screen';
import Logo from '../src/components/Logo';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import RadioOption from '../src/components/RadioOption';
import { ErrorText, LinkText, Title } from '../src/components/Texts';
import { GOAL_OPTIONS } from '../src/data/planMeta';
import { signUp, SignUpData } from '../src/services/auth';
import { colors, fonts } from '../src/theme';

export default function Register() {
  const [f, setF] = useState<SignUpData>({ name: '', email: '', password: '', age: '', weight: '', height: '', goal: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof SignUpData) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const { needsConfirmation } = await signUp(f);
      router.replace({ pathname: '/register-success', params: { confirm: needsConfirmation ? '1' : '' } });
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={12} style={{ position: 'absolute', left: 16, top: 16 }}>
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </Pressable>
      <View style={{ marginTop: 8, marginBottom: 24 }}><Logo size={40} /></View>
      <Title style={{ textAlign: 'left', marginBottom: 20 }}>Crie sua conta</Title>
      <ErrorText>{error}</ErrorText>

      <Input label="Nome" placeholder="Digite seu nome completo" value={f.name} onChangeText={set('name')} />
      <Input label="E-mail" placeholder="Digite seu e-mail" keyboardType="email-address"
        value={f.email} onChangeText={set('email')} />
      <Input label="Senha" placeholder="Crie uma senha (6+ caracteres)" password value={f.password} onChangeText={set('password')} />

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Input box={{ flex: 1 }} label="Idade" placeholder="00" keyboardType="number-pad"
          value={f.age} onChangeText={set('age')} />
        <Input box={{ flex: 1 }} label="Peso" placeholder="00" suffix="kg" keyboardType="decimal-pad"
          value={f.weight} onChangeText={set('weight')} />
        <Input box={{ flex: 1 }} label="Altura" placeholder="0,00" suffix="m" keyboardType="decimal-pad"
          value={f.height} onChangeText={set('height')} />
      </View>

      <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: colors.muted, marginBottom: 12 }}>Objetivo</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 28 }}>
        {GOAL_OPTIONS.map((g) => (
          <RadioOption key={g.slug} label={g.label} on={f.goal === g.slug}
            onPress={() => setF((s) => ({ ...s, goal: g.slug }))} />
        ))}
      </View>

      <Button title="Criar minha conta" loadingTitle="Criando..." loading={loading} onPress={onSubmit} />
      <View style={{ alignItems: 'center', marginTop: 28 }}>
        <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginBottom: 6 }}>
          Já possui uma conta?
        </Text>
        <LinkText onPress={() => router.replace('/login')}>Entrar</LinkText>
      </View>
    </Screen>
  );
}
