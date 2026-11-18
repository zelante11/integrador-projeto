import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../src/components/Input';
import LoadChart from '../../src/components/LoadChart';
import OptionChip from '../../src/components/OptionChip';
import { FREQUENCY_OPTIONS, LEVEL_OPTIONS, planIcon } from '../../src/data/planMeta';
import { logout } from '../../src/services/auth';
import { useData } from '../../src/state/DataProvider';
import { ExperienceLevel, MEASURE_KEYS, MeasureKey, Measures } from '../../src/types';
import { dateOnly, fmt, show, toNum } from '../../src/utils/format';
import { bestRecords } from '../../src/utils/stats';
import { colors, fonts, radius } from '../../src/theme';

const MEASURES = MEASURE_KEYS;

// Diferença entre a última medição e a anterior (ex.: "+1,5" / "-2").
function delta(key: MeasureKey, cur?: Measures, prev?: Measures): string | null {
  const a = cur?.[key], b = prev?.[key];
  if (a == null || b == null) return null;
  const d = Math.round((a - b) * 10) / 10;
  if (d === 0) return null;
  return `${d > 0 ? '+' : ''}${fmt(d)}`;
}

export default function Perfil() {
  const { profile, selectedPlan, measures, saveMeasures, updateProfile, stats, records } = useData();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ age: '', weight: '', height: '', bodyFat: '' });
  const [level, setLevel] = useState<ExperienceLevel>('iniciante');
  const [frequency, setFrequency] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Medidas corporais (cm)
  const [measuresOpen, setMeasuresOpen] = useState(false);
  const [measuresDraft, setMeasuresDraft] = useState<Record<string, string>>({});
  const [measuresError, setMeasuresError] = useState<string | null>(null);
  const [measuresSaving, setMeasuresSaving] = useState(false);

  const latest = measures[0];
  const previous = measures[1];
  const top = bestRecords(records).slice(0, 5);
  const bmi = profile.weight && profile.height ? profile.weight / (profile.height * profile.height) : null;

  function startEdit() {
    setDraft({
      age: profile.age?.toString() ?? '',
      weight: profile.weight != null ? show(profile.weight, 1) : '',
      height: profile.height != null ? show(profile.height, 2) : '',
      bodyFat: profile.bodyFat != null ? show(profile.bodyFat, 1) : '',
    });
    setLevel(profile.experienceLevel ?? 'iniciante');
    setFrequency(FREQUENCY_OPTIONS.includes(profile.desiredFrequency) ? profile.desiredFrequency : 3);
    setError(null);
    setEditing(true);
  }

  function openMeasures() {
    setMeasuresDraft(Object.fromEntries(MEASURES.map((m) => [m, latest?.values[m] == null ? '' : fmt(latest.values[m])])));
    setMeasuresError(null);
    setMeasuresOpen(true);
  }

  async function submitMeasures() {
    const next = {} as Measures;
    let any = false;
    for (const m of MEASURES) {
      const raw = measuresDraft[m]?.trim();
      const n = raw ? toNum(raw) : null;
      if (raw && n == null) return setMeasuresError(`Valor inválido em ${m}`);
      if (n != null && (n < 5 || n > 300)) return setMeasuresError(`${m}: use um valor entre 5 e 300 cm`);
      if (n != null) any = true;
      next[m] = n;
    }
    if (!any) return setMeasuresError('Informe ao menos uma medida');
    setMeasuresError(null);
    setMeasuresSaving(true);
    try {
      await saveMeasures(next);
      setMeasuresOpen(false);
    } catch {
      setMeasuresError('Não foi possível salvar. Tente novamente.');
    } finally {
      setMeasuresSaving(false);
    }
  }

  async function save() {
    const age = toNum(draft.age), weight = toNum(draft.weight), height = toNum(draft.height), bodyFat = toNum(draft.bodyFat);
    if (age != null && (age < 10 || age > 120)) return setError('Idade inválida');
    if (weight != null && (weight < 20 || weight > 400)) return setError('Peso inválido (use kg)');
    if (height != null && (height < 0.5 || height > 2.5)) return setError('Altura inválida (use metros, ex: 1,70)');
    if (bodyFat != null && (bodyFat < 2 || bodyFat > 70)) return setError('Gordura corporal inválida (2% a 70%)');
    setError(null);
    setSaving(true);
    try {
      await updateProfile({ age: age == null ? null : Math.round(age), weight, height, bodyFat, experienceLevel: level, desiredFrequency: frequency });
      setEditing(false);
    } catch {
      setError('Não foi possível salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await logout();
    router.replace('/');
  }

  const levelLabel = LEVEL_OPTIONS.find((l) => l.value === profile.experienceLevel)?.label ?? '—';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.topRow}>
            <Text style={s.pageTitle}>Meu perfil</Text>
            <Pressable style={s.gear} onPress={() => router.push('/configuracoes')}>
              <Ionicons name="settings-outline" size={20} color={colors.text} />
            </Pressable>
          </View>

          <View style={s.userRow}>
            <View style={s.avatar}><Text style={s.avatarText}>{profile.name[0]?.toUpperCase()}</Text></View>
            <View style={{ marginLeft: 16, flex: 1 }}>
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
              <Input label="Gordura corporal (opcional)" placeholder="0" suffix="%" keyboardType="decimal-pad"
                value={draft.bodyFat} onChangeText={(v) => setDraft((d) => ({ ...d, bodyFat: v }))} />

              <Text style={[s.infoLabel, { marginBottom: 10 }]}>Experiência</Text>
              <View style={s.wrap}>
                {LEVEL_OPTIONS.map((l) => (
                  <OptionChip key={l.value} label={l.label} on={level === l.value} onPress={() => setLevel(l.value)} />
                ))}
              </View>
              <Text style={[s.infoLabel, { marginTop: 8, marginBottom: 10 }]}>Dias de treino por semana</Text>
              <View style={s.wrap}>
                {FREQUENCY_OPTIONS.map((n) => (
                  <OptionChip key={n} label={`${n}`} on={frequency === n} onPress={() => setFrequency(n)} />
                ))}
              </View>

              {error && <Text style={s.error}>{error}</Text>}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <Pressable style={[s.btn, s.btnGhost]} onPress={() => setEditing(false)}>
                  <Text style={s.btnGhostText}>Cancelar</Text>
                </Pressable>
                <Pressable style={[s.btn, s.btnPrimary, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
                  <Text style={s.btnPrimaryText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
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
              <View style={{ flexDirection: 'row', marginTop: 18 }}>
                <Info label="Gordura corporal" value={show(profile.bodyFat, 1)} unit="%" />
                <Info label="Experiência" value={levelLabel} unit="" />
                <Info label="Frequência" value={String(profile.desiredFrequency)} unit="dias/sem" />
              </View>
              <Pressable style={s.goalRow} onPress={() => router.navigate('/planos')}>
                <Text style={s.infoLabel}>Plano atual</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name={planIcon(selectedPlan?.slug)} size={16} color={colors.primary} />
                  <Text style={s.goal}>{selectedPlan?.label ?? 'Escolher'}</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </View>
              </Pressable>
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

          <Text style={[s.h2, { marginTop: 28 }]}>Recordes pessoais</Text>
          {top.length === 0 ? (
            <Text style={s.hint}>Seus recordes aparecem aqui quando você registra cargas nos treinos.</Text>
          ) : (
            <View style={{ marginTop: 8 }}>
              {top.map((r) => (
                <View key={r.exerciseId} style={s.prRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.prName}>{r.exerciseName}</Text>
                    <Text style={s.prDate}>{dateOnly(r.recordedOn)}</Text>
                  </View>
                  <Text style={s.prValue}>{fmt(r.weightKg)} kg</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={[s.h2, { marginTop: 28 }]}>Medidas corporais</Text>
          <Text style={s.hint}>
            {latest ? `Última medição em ${dateOnly(latest.measuredOn)}.` : 'Registre suas medidas para acompanhar a evolução.'}
          </Text>
          <View style={s.grid}>
            {MEASURES.map((m) => {
              const d = delta(m, latest?.values, previous?.values);
              return (
                <Pressable key={m} style={s.measure} onPress={openMeasures}>
                  <Text style={s.measureName}>{m}</Text>
                  {d && <Text style={[s.delta, d.startsWith('-') ? { color: colors.primary } : { color: colors.muted }]}>{d}</Text>}
                  <Text style={s.measureVal}>{fmt(latest?.values[m] ?? null)} cm</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </Pressable>
              );
            })}
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

          <Pressable style={s.logout} onPress={signOut}>
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
            <Text style={s.hint}>Informe em centímetros. Cada registro fica salvo no seu histórico.</Text>
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
              <Pressable style={[s.btn, s.btnPrimary, measuresSaving && { opacity: 0.6 }]} onPress={submitMeasures} disabled={measuresSaving}>
                <Text style={s.btnPrimaryText}>{measuresSaving ? 'Salvando...' : 'Salvar'}</Text>
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
        {unit ? <Text style={s.infoUnit}> {unit}</Text> : null}
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
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 },
  goal: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
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
  prRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.cream },
  prName: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  prDate: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 2 },
  prValue: { fontFamily: fonts.heading, fontSize: 22, color: colors.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 20 },
  measure: { width: '47%', flexDirection: 'row', alignItems: 'center', height: 36, borderBottomWidth: 1, borderBottomColor: colors.cream },
  measureName: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.text },
  delta: { fontFamily: fonts.bodyBold, fontSize: 10, marginRight: 6 },
  measureVal: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginRight: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: radius.card, backgroundColor: colors.cream, marginTop: 16 },
  addText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  history: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  historyText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primary },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 },
  logoutText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.muted },
});
