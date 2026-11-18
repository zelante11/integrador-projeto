import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../src/components/Header';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import { useData } from '../src/state/DataProvider';
import { colors, fonts } from '../src/theme';

export default function Configuracoes() {
  const { profile, updateProfile } = useData();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email ?? '');
  const [reminders, setReminders] = useState(profile.remindersEnabled);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return setError('Informe seu nome');
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return setError('E-mail inválido');
    setError(null);
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() || null, remindersEnabled: reminders });
      router.back();
    } catch {
      setError('Não foi possível salvar. Tente novamente.');
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Header title="Configurações" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={s.h2}>Conta</Text>
          <Input label="Nome" placeholder="Seu nome" value={name} onChangeText={setName} />
          <Input label="E-mail" placeholder="Digite seu e-mail" keyboardType="email-address"
            value={email} onChangeText={setEmail} />

          <Text style={[s.h2, { marginTop: 12 }]}>Preferências</Text>
          <View style={s.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={s.switchTitle}>Lembretes de treino</Text>
              <Text style={s.switchSub}>Receba um aviso nos dias de treino.</Text>
            </View>
            <Switch value={reminders} onValueChange={setReminders}
              trackColor={{ true: colors.primary, false: colors.line }} thumbColor={colors.white} />
          </View>

          {error && <Text style={s.error}>{error}</Text>}
          <Button title="Salvar alterações" loadingTitle="Salvando..." loading={saving} onPress={save} />

          <Pressable style={s.logout} onPress={() => router.replace('/login')}>
            <Ionicons name="log-out-outline" size={18} color={colors.muted} />
            <Text style={s.logoutText}>Sair da conta</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  h2: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, marginBottom: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  switchTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  switchSub: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  error: { fontFamily: fonts.body, fontSize: 12, color: colors.error, textAlign: 'center', marginBottom: 12 },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 },
  logoutText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.muted },
});
