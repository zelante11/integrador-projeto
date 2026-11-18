import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../src/components/Header';
import Input from '../src/components/Input';
import Button from '../src/components/Button';
import { logout } from '../src/services/auth';
import { useData } from '../src/state/DataProvider';
import { colors, fonts } from '../src/theme';

export default function Configuracoes() {
  const { profile, settings, updateProfile, updateSettings } = useData();
  const [name, setName] = useState(profile.name);
  const [reminders, setReminders] = useState(settings.reminders);
  const [weeklySummary, setWeeklySummary] = useState(settings.weeklySummary);
  const [assistantVisible, setAssistantVisible] = useState(settings.assistantVisible);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return setError('Informe seu nome');
    setError(null);
    setSaving(true);
    try {
      await Promise.all([
        updateProfile({ name: name.trim() }),
        updateSettings({ reminders, weeklySummary, assistantVisible }),
      ]);
      router.back();
    } catch {
      setError('Não foi possível salvar. Tente novamente.');
      setSaving(false);
    }
  }

  async function signOut() {
    await logout();
    router.replace('/');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Header title="Configurações" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={s.h2}>Conta</Text>
          <Input label="Nome" placeholder="Seu nome" value={name} onChangeText={setName} />
          <View style={{ marginBottom: 20 }}>
            <Text style={s.label}>E-mail</Text>
            <Text style={s.readonly}>{profile.email ?? 'E-mail não informado'}</Text>
          </View>

          <Text style={[s.h2, { marginTop: 12 }]}>Preferências</Text>
          <SwitchRow title="Lembretes de treino" sub="Receba um aviso nos dias de treino." value={reminders} onChange={setReminders} />
          <SwitchRow title="Resumo semanal" sub="Um resumo da sua evolução toda semana." value={weeklySummary} onChange={setWeeklySummary} />
          <SwitchRow title="Mostrar o CoachPro" sub="Exibe o atalho do assistente na tela inicial." value={assistantVisible} onChange={setAssistantVisible} />

          {error && <Text style={s.error}>{error}</Text>}
          <Button title="Salvar alterações" loadingTitle="Salvando..." loading={saving} onPress={save} />

          <Pressable style={s.logout} onPress={signOut}>
            <Ionicons name="log-out-outline" size={18} color={colors.muted} />
            <Text style={s.logoutText}>Sair da conta</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SwitchRow({ title, sub, value, onChange }: { title: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={s.switchRow}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={s.switchTitle}>{title}</Text>
        <Text style={s.switchSub}>{sub}</Text>
      </View>
      <Switch value={value} onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.line }} thumbColor={colors.white} />
    </View>
  );
}

const s = StyleSheet.create({
  h2: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, marginBottom: 12 },
  label: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.muted, marginBottom: 2 },
  readonly: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, paddingVertical: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  switchTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  switchSub: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  error: { fontFamily: fonts.body, fontSize: 12, color: colors.error, textAlign: 'center', marginBottom: 12 },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 },
  logoutText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.muted },
});
