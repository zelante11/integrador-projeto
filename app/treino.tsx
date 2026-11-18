import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../src/components/Header';
import Button from '../src/components/Button';
import Loading from '../src/components/Loading';
import { db } from '../src/services/db';
import { useData } from '../src/state/DataProvider';
import { PlanSlug } from '../src/types';
import { fmt, restLabel, toNum } from '../src/utils/format';
import { orderExercises } from '../src/utils/plan';
import { useAsync } from '../src/utils/useAsync';
import { colors, fonts, radius } from '../src/theme';

type Row = { load: string; reps: string };

export default function Treino() {
  const { slug, day } = useLocalSearchParams<{ slug: PlanSlug; day: string }>();
  const { addLog, logs } = useData();

  const q = useAsync(async () => {
    const [plan, order] = await Promise.all([db.getPlan(slug), db.getPlanOrder(slug)]);
    return { plan, order };
  }, [slug]);

  const [entries, setEntries] = useState<Record<number, Row[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (q.error || !q.data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
        <Header title="Treino" />
        <Loading error={q.error} onRetry={q.reload} />
      </SafeAreaView>
    );
  }

  const { plan, order } = q.data;
  const list = orderExercises(plan.exercises, order).active.filter((e) => e.dayLabel === day);

  const blank = (sets: number): Row[] => Array.from({ length: sets }, () => ({ load: '', reps: '' }));
  const rowsOf = (id: number, sets: number) => entries[id] ?? blank(sets);
  const setCell = (id: number, sets: number, idx: number, field: keyof Row, v: string) =>
    setEntries((s) => ({ ...s, [id]: (s[id] ?? blank(sets)).map((r, i) => (i === idx ? { ...r, [field]: v } : r)) }));

  // Cargas do último treino com o mesmo exercício, usadas como referência no campo.
  const lastSets = (exerciseId: string) =>
    logs.flatMap((l) => l.exercises).find((e) => e.exerciseId === exerciseId)?.sets ?? [];

  async function finish() {
    const exercises = list
      .map((e) => ({
        exerciseId: e.exercise.id,
        exerciseName: e.exercise.name,
        sets: rowsOf(e.id, e.sets)
          .map((r) => ({ load: toNum(r.load) ?? 0, reps: toNum(r.reps) ?? 0 }))
          .filter((x) => x.load > 0 || x.reps > 0),
      }))
      .filter((e) => e.sets.length > 0);

    if (exercises.length === 0) return setError('Registre ao menos uma série para finalizar.');
    if (exercises.some((e) => e.sets.some((x) => x.load > 1000 || x.reps > 1000))) return setError('Confira os valores: há uma carga ou repetição fora do normal.');
    setError(null);
    setSaving(true);
    try {
      const { newRecords } = await addLog({
        planSlug: plan.slug,
        dayLabel: day,
        workoutName: `${plan.label} · ${day}`,
        date: new Date().toISOString(),
        exercises,
      });
      const prs = newRecords.map((r) => `${r.exerciseName}|${r.weightKg}`).join(';');
      router.replace({ pathname: '/historico', params: prs ? { prs } : {} });
    } catch {
      setError('Não foi possível salvar o treino. Tente novamente.');
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Header title={day} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={s.sub}>{plan.label} · preencha a carga (kg) e as repetições de cada série.</Text>

          {list.length === 0 && <Text style={s.sub}>Nenhum exercício neste treino. Restaure algum em "Personalizar" no plano.</Text>}

          {list.map((e) => {
            const prev = lastSets(e.exercise.id);
            return (
              <View key={e.id} style={s.card}>
                <Pressable style={s.cardHead}
                  onPress={() => router.push({ pathname: '/exercicio/[id]', params: { id: String(e.id) } })}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.exName}>{e.exercise.name}</Text>
                    <Text style={s.exTarget}>{e.sets} séries · {e.reps} repetições · descanso {restLabel(e.restSeconds)}</Text>
                  </View>
                  <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
                </Pressable>
                <View style={s.headRow}>
                  <Text style={[s.th, { width: 56 }]}>Série</Text>
                  <Text style={[s.th, { flex: 1 }]}>Carga (kg)</Text>
                  <Text style={[s.th, { flex: 1 }]}>Repetições</Text>
                </View>
                {rowsOf(e.id, e.sets).map((r, i) => (
                  <View key={i} style={s.setRow}>
                    <Text style={s.setNum}>{i + 1}</Text>
                    <TextInput style={s.cell} value={r.load}
                      placeholder={prev[i] ? fmt(prev[i].load) : '0'} placeholderTextColor={colors.placeholder}
                      keyboardType="decimal-pad" onChangeText={(v) => setCell(e.id, e.sets, i, 'load', v)} />
                    <TextInput style={s.cell} value={r.reps}
                      placeholder={prev[i] ? String(prev[i].reps) : e.reps} placeholderTextColor={colors.placeholder}
                      keyboardType="number-pad" onChangeText={(v) => setCell(e.id, e.sets, i, 'reps', v)} />
                  </View>
                ))}
              </View>
            );
          })}

          {error && <Text style={s.error}>{error}</Text>}
          {list.length > 0 && (
            <Button title="Finalizar treino" loadingTitle="Salvando..." loading={saving} onPress={finish} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  sub: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginBottom: 16 },
  card: { backgroundColor: colors.creamLight, borderRadius: radius.card, padding: 16, marginBottom: 14 },
  cardHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  exName: { fontFamily: fonts.heading, fontSize: 20, color: colors.text },
  exTarget: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
  headRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  th: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.muted },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  setNum: { width: 56, fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primary },
  cell: {
    flex: 1, height: 40, borderRadius: 10, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line,
    paddingHorizontal: 12, fontFamily: fonts.bodySemi, fontSize: 14, color: colors.text,
  },
  error: { fontFamily: fonts.body, fontSize: 12, color: colors.error, textAlign: 'center', marginBottom: 12 },
});
