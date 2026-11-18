import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '../../src/components/Header';
import Button from '../../src/components/Button';
import { useData } from '../../src/state/DataProvider';
import { colors, fonts, radius } from '../../src/theme';
import { toNum } from '../../src/utils/format';

type Row = { load: string; reps: string };

export default function Treino() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workouts, addLog } = useData();
  const workout = workouts.find((w) => w.id === id);

  const [entries, setEntries] = useState<Record<string, Row[]>>(() =>
    Object.fromEntries(
      (workout?.exercises ?? []).map((e) => [e.id, Array.from({ length: e.sets }, () => ({ load: '', reps: '' }))]),
    ),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!workout) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <Header title="Treino" />
        <Text style={{ padding: 24, fontFamily: fonts.body, color: colors.muted }}>Treino não encontrado.</Text>
      </SafeAreaView>
    );
  }

  const setCell = (exId: string, idx: number, field: keyof Row, v: string) =>
    setEntries((s) => ({ ...s, [exId]: s[exId].map((r, i) => (i === idx ? { ...r, [field]: v } : r)) }));

  async function finish() {
    const exercises = workout!.exercises
      .map((e) => ({
        exerciseId: e.id,
        exerciseName: e.name,
        sets: entries[e.id]
          .map((r) => ({ load: toNum(r.load) ?? 0, reps: toNum(r.reps) ?? 0 }))
          .filter((x) => x.load > 0 || x.reps > 0),
      }))
      .filter((e) => e.sets.length > 0);

    if (exercises.length === 0) return setError('Registre ao menos uma série para finalizar.');
    setError(null);
    setSaving(true);
    try {
      await addLog({
        workoutId: workout!.id,
        workoutName: `${workout!.name} · ${workout!.focus}`,
        date: new Date().toISOString(),
        exercises,
      });
      router.replace('/historico');
    } catch {
      setError('Não foi possível salvar o treino. Tente novamente.');
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Header title={workout.focus} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={s.sub}>{workout.name} · preencha a carga (kg) e as repetições de cada série.</Text>

          {workout.exercises.map((e) => (
            <View key={e.id} style={s.card}>
              <Text style={s.exName}>{e.name}</Text>
              <Text style={s.exTarget}>{e.sets} séries · {e.reps}</Text>
              <View style={s.headRow}>
                <Text style={[s.th, { width: 56 }]}>Série</Text>
                <Text style={[s.th, { flex: 1 }]}>Carga (kg)</Text>
                <Text style={[s.th, { flex: 1 }]}>Repetições</Text>
              </View>
              {entries[e.id].map((r, i) => (
                <View key={i} style={s.setRow}>
                  <Text style={s.setNum}>{i + 1}</Text>
                  <TextInput style={s.cell} value={r.load} placeholder="0" placeholderTextColor={colors.placeholder}
                    keyboardType="decimal-pad" onChangeText={(v) => setCell(e.id, i, 'load', v)} />
                  <TextInput style={s.cell} value={r.reps} placeholder="0" placeholderTextColor={colors.placeholder}
                    keyboardType="number-pad" onChangeText={(v) => setCell(e.id, i, 'reps', v)} />
                </View>
              ))}
            </View>
          ))}

          {error && <Text style={s.error}>{error}</Text>}
          <Button title="Finalizar treino" loadingTitle="Salvando..." loading={saving} onPress={finish} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  sub: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginBottom: 16 },
  card: { backgroundColor: colors.creamLight, borderRadius: radius.card, padding: 16, marginBottom: 14 },
  exName: { fontFamily: fonts.heading, fontSize: 20, color: colors.text },
  exTarget: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginBottom: 12 },
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
