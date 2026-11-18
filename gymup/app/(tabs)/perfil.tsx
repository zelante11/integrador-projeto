import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../src/components/Input';
import LoadChart from '../../src/components/LoadChart';
import { useData } from '../../src/state/DataProvider';
import { MEASURE_KEYS, Measures, GoalId } from '../../src/types';
import { fmt, show, toNum } from '../../src/utils/format';
import { colors, fonts, radius } from '../../src/theme';

const MEASURES = MEASURE_KEYS;

export default function Perfil() {
  const { profile, goal, goals, measures, saveMeasures, updateProfile, stats } = useData();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<{ age: string; weight: string; height: string; goalId: GoalId }>(
    { age: '', weight: '', height: '', goalId: profile.goalId });
  const [error, setError] = useState<string | null>(null);

  // Medidas corporais (cm)
  const [measuresOpen, setMeasuresOpen] = useState(false);
  const [measuresDraft, setMeasuresDraft] = useState<Record<string, string>>({});
  const [measuresError, setMeasuresError] = useState<string | null>(null);

  const bmi = profile.weight && profile.height ? profile.weight / (profile.height * profile.height) : null;

  function startEdit() {
    setDraft({
      age: profile.age?.toString() ?? '',
      weight: profile.weight != null ? show(profile.weight, 1) : '',
      height: profile.height != null ? show(profile.height, 2) : '',
      goalId: profile.goalId,
    });
    setError(null);
    setEditing(true);
  }

  function openMeasures() {
    setMeasuresDraft(Object.fromEntries(MEASURES.map((m) => [m, measures[m] == null ? '' : fmt(measures[m])])));
    setMeasuresError(null);
    setMeasuresOpen(true);
  }

  function submitMeasures() {
    const next = {} as Measures;
    for (const m of MEASURES) {
      const raw = measuresDraft[m]?.trim();
      const n = raw ? toNum(raw) : null;
      if (raw && n == null) return setMeasuresError(`Valor inválido em ${m}`);
      if (n != null && (n < 5 || n > 300)) return setMeasuresError(`${m}: use um valor entre 5 e 300 cm`);
      next[m] = n;
    }
    saveMeasures(next);
    setMeasuresOpen(false);
  }

  function save() {
    const age = toNum(draft.age), weight = toNum(draft.weight), height = toNum(draft.height);
    if (age != null && (age < 10 || age > 120)) return setError('Idade inválida');
    if (weight != null && (weight < 20 || weight > 400)) return setError('Peso inválido (use kg)');
    if (height != null && (height < 0.5 || height > 2.5)) return setError('Altura inválida (use metros, ex: 1,70)');
    updateProfile({ age, weight, height, goalId: draft.goalId });
    setEditing(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.topRow}>
            <Text style={s.pageTitle}>Meu perfil</Text>
            <Pressable style={s.gear} onPress={() => router.push('/configuracoes')}><Ionicons name="settings-outline" size={20} color={colors.text} /></Pressable>
          </View>

          <View style={s.userRow}>
            <View style={s.avatar}><Text style={s.avatarText}>{profile.name[0]?.toUpperCase()}</Text></View>
            <View style={{ marginLeft: 16 }}>
              <Text style={s.name}>{profile.name}</Text>
              <Text style={s.email}>{profile.email ?? 'E-mail não informado'}</Text>
            </View>
          </View>
          <View style={s.divider} />

          <View style={s.sectionHead}>
            <Text style={s.h2}>Informações pessoais</Text>
            {!editing && (
              <Pressable style={s.edit} onPress={startEdit} hitSlop={10}>
                <Ionicons name="pencil" size={12} color={colors.primary} />
                <Text style={s.editText}>Editar</Text>
              </Pressable>
            )}
          </View>

          {editing ? (
            <View>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Input box={{ flex: 1 }} label="Idade" placeholder="00" keyboardType="number-pad"
                  value={draft.age} onChangeText={(v) => setDraft((d) => ({ ...d, age: v }))} />
                <Input box={{ flex: 1 }} label="Peso" placeholder="00" suffix="kg" keyboardType="decimal-pad"
                  value={draft.weight} onChangeText={(v) => setDraft((d) => ({ ...d, weight: v }))} />
                <Input box={{ flex: 1 }} label="Altura" placeholder="0,00" suffix="m" keyboardType="decimal-pad"
                  value={draft.height} onChangeText={(v) => setDraft((d) => ({ ...d, height: v }))} />
              </View>

              <Text style={s.infoLabel}>Objetivo atual</Text>
              <View style={s.goalGrid}>
                {goals.map((g) => {
                  const on = draft.goalId === g.id;
                  return (
                    <Pressable key={g.id} style={s.goalOpt} onPress={() => setDraft((d) => ({ ...d, goalId: g.id }))}>
                      <View style={s.radio}>{on && <View style={s.radioDot} />}</View>
                      <Text style={s.goalOptText}>{g.name}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {error && <Text style={s.error}>{error}</Text>}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                <Pressable style={[s.btn, s.btnGhost]} onPress={() => setEditing(false)}>
                  <Text style={s.btnGhostText}>Cancelar</Text>
                </Pressable>
                <Pressable style={[s.btn, s.btnPrimary]} onPress={save}>
                  <Text style={s.btnPrimaryText}>Salvar</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row' }}>
                <Info label="Idade" value={show(profile.age)} unit="anos" />
                <Info label="Peso" value={show(profile.weight, 1)} unit="kg" />
                <Info label="Altura" value={show(profile.height, 2)} unit="m" />
              </View>
              <View style={s.goalRow}>
                <Text style={s.infoLabel}>Objetivo atual</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name={goal.icon as any} size={16} color={colors.primary} />
                  <Text style={s.goal}>{goal.name}</Text>
                </View>
              </View>
            </>
          )}

          <Text style={[s.h2, { marginTop: 28, marginBottom: 12 }]}>Sua evolução</Text>
          <View style={s.statsCard}>
            <Stat label={'Maior carga\nregistrada'} value={fmt(stats.maxLoad)} unit="kg" />
            <View style={s.vline} />
            <Stat label={'Recordes\npessoais'} value={stats.recordCount ? show(stats.recordCount) : '—'} unit="exercícios" />
            <View style={s.vline} />
            <Stat label="IMC" value={show(bmi, 1)} unit="kg/m²" />
          </View>

          <Text style={[s.h2, { marginTop: 28 }]}>Medidas corporais</Text>
          <Text style={s.hint}>Consulte suas medidas ou registre uma nova.</Text>
          <View style={s.grid}>
            {MEASURES.map((m) => (
              <Pressable key={m} style={s.measure} onPress={openMeasures}>
                <Text style={s.measureName}>{m}</Text>
                <Text style={s.measureVal}>{fmt(measures[m])} cm</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </Pressable>
            ))}
          </View>
          <Pressable style={s.addBtn} onPress={openMeasures}>
            <Ionicons name="add" size={18} color={colors.text} />
            <Text style={s.addText}>Registrar medidas</Text>
          </Pressable>

          <Text style={[s.h2, { marginTop: 28 }]}>Evolução das cargas</Text>
          <LoadChart data={stats.series} />
          <Pressable style={s.history} onPress={() => router.push('/historico')}>
            <Text style={s.historyText}>Ver histórico completo</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </Pressable>

          <Pressable style={s.logout} onPress={() => router.replace('/login')}>
            <Ionicons name="log-out-outline" size={18} color={colors.muted} />
            <Text style={s.logoutText}>Sair da conta</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={measuresOpen} animationType="slide" transparent onRequestClose={() => setMeasuresOpen(false)}>
        <KeyboardAvoidingView style={s.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={{ flex: 1 }} onPress={() => setMeasuresOpen(false)} />
          <View style={s.sheet}>
            <View style={s.sheetHead}>
              <Text style={s.h2}>Registrar medidas</Text>
              <Pressable onPress={() => setMeasuresOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>
            <Text style={s.hint}>Informe em centímetros. Deixe em branco o que não quiser registrar.</Text>
            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 360 }}>
              <View style={s.sheetGrid}>
                {MEASURES.map((m) => (
                  <Input key={m} box={{ width: '47%' }} label={m} placeholder="0" suffix="cm" keyboardType="decimal-pad"
                    value={measuresDraft[m] ?? ''}
                    onChangeText={(v) => setMeasuresDraft((d) => ({ ...d, [m]: v }))} />
                ))}
              </View>
            </ScrollView>
            {measuresError && <Text style={s.error}>{measuresError}</Text>}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <Pressable style={[s.btn, s.btnGhost]} onPress={() => setMeasuresOpen(false)}>
                <Text style={s.btnGhostText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[s.btn, s.btnPrimary]} onPress={submitMeasures}>
                <Text style={s.btnPrimaryText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function Info({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.infoLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
        <Text style={s.infoValue}>{value}</Text>
        <Text style={s.infoUnit}> {unit}</Text>
      </View>
    </View>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 10 }}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statUnit}>{unit}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(38,58,64,0.35)' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32 },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pageTitle: { fontFamily: fonts.heading, fontSize: 32, color: colors.text },
  gear: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.heading, fontSize: 30, color: colors.primary },
  name: { fontFamily: fonts.heading, fontSize: 26, color: colors.text },
  email: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.cream, marginVertical: 20 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  h2: { fontFamily: fonts.heading, fontSize: 24, color: colors.text },
  edit: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.primary },
  infoLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  infoValue: { fontFamily: fonts.heading, fontSize: 22, color: colors.text },
  infoUnit: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 },
  goal: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, marginBottom: 12 },
  goalOpt: { width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  goalOptText: { fontFamily: fonts.body, fontSize: 13, color: colors.text },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  error: { fontFamily: fonts.body, fontSize: 12, color: colors.error, marginBottom: 12 },
  btn: { flex: 1, height: 48, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: colors.primary },
  btnPrimaryText: { fontFamily: fonts.bodyHeavy, fontSize: 15, color: colors.text },
  btnGhost: { backgroundColor: colors.cream },
  btnGhostText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  statsCard: { flexDirection: 'row', backgroundColor: colors.cream, borderRadius: radius.card, paddingVertical: 14, paddingHorizontal: 4 },
  vline: { width: 1, backgroundColor: colors.line, opacity: 0.5 },
  statLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.text, minHeight: 30 },
  statValue: { fontFamily: fonts.heading, fontSize: 24, color: colors.text, marginVertical: 6 },
  statUnit: { fontFamily: fonts.body, fontSize: 10, color: colors.muted },
  hint: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 4, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 20 },
  measure: { width: '47%', flexDirection: 'row', alignItems: 'center', height: 36, borderBottomWidth: 1, borderBottomColor: colors.cream },
  measureName: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.text },
  measureVal: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginRight: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: radius.card, backgroundColor: colors.cream, marginTop: 16 },
  addText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  emptyLine: { height: 1, backgroundColor: colors.cream },
  emptyText: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textAlign: 'center', paddingVertical: 14 },
  history: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  historyText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primary },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 },
  logoutText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.muted },
});
