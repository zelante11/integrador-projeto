import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import Header from '../../src/components/Header';
import Button from '../../src/components/Button';
import Chip from '../../src/components/Chip';
import ExerciseVideo from '../../src/components/ExerciseVideo';
import Input from '../../src/components/Input';
import Loading from '../../src/components/Loading';
import { db } from '../../src/services/db';
import { useData } from '../../src/state/DataProvider';
import { dateOnly, fmt, restLabel, toNum } from '../../src/utils/format';
import { useAsync } from '../../src/utils/useAsync';
import { colors, fonts, radius } from '../../src/theme';

export default function Exercicio() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { records, addRecord } = useData();

  const q = useAsync(async () => {
    const planExercise = await db.getPlanExercise(Number(id));
    const note = await db.getNote(planExercise.exercise.id);
    return { planExercise, note };
  }, [id]);

  const [note, setNote] = useState<string | null>(null);
  const [noteMsg, setNoteMsg] = useState<string | null>(null);
  const [noteSaving, setNoteSaving] = useState(false);
  const [load, setLoad] = useState('');
  const [recordError, setRecordError] = useState<string | null>(null);
  const [recordSaving, setRecordSaving] = useState(false);

  if (q.error || !q.data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
        <Header title="Exercício" />
        <Loading error={q.error} onRetry={q.reload} />
      </SafeAreaView>
    );
  }

  const { planExercise: pe } = q.data;
  const ex = pe.exercise;
  const noteValue = note ?? q.data.note;
  const mine = records.filter((r) => r.exerciseId === ex.id);
  const best = mine.reduce<number | null>((m, r) => (m == null || r.weightKg > m ? r.weightKg : m), null);

  async function saveNote() {
    setNoteMsg(null);
    setNoteSaving(true);
    try {
      await db.saveNote(ex.id, noteValue);
      setNoteMsg('Anotação salva.');
    } catch {
      setNoteMsg('Não foi possível salvar. Tente novamente.');
    } finally {
      setNoteSaving(false);
    }
  }

  async function saveRecord() {
    const kg = toNum(load);
    if (kg == null || kg <= 0 || kg > 1000) return setRecordError('Informe uma carga válida em kg');
    setRecordError(null);
    setRecordSaving(true);
    try {
      await addRecord(ex.id, kg);
      setLoad('');
    } catch {
      setRecordError('Não foi possível salvar. Tente novamente.');
    } finally {
      setRecordSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Header title={ex.name} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {ex.videoUrl && <ExerciseVideo uri={ex.videoUrl} />}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 }}>
            {ex.equipment && <Chip label={ex.equipment} />}
            {ex.primaryMuscle && <Chip label={`Principal: ${ex.primaryMuscle}`} />}
            {pe.secondaryMuscle && <Chip label={`Apoio: ${pe.secondaryMuscle}`} />}
          </View>

          <View style={s.statsCard}>
            <Stat label="Séries" value={`${pe.sets} x ${pe.reps}`} />
            <View style={s.vline} />
            <Stat label="Descanso" value={restLabel(pe.restSeconds)} />
            <View style={s.vline} />
            <Stat label="Dificuldade" value={pe.difficulty != null ? `${fmt(pe.difficulty)}/5` : '—'} />
          </View>

          {pe.notes && (
            <View style={s.tip}>
              <Text style={s.tipTitle}>Dica</Text>
              <Text style={s.tipText}>{pe.notes}</Text>
            </View>
          )}

          {pe.instructions.length > 0 && (
            <>
              <Text style={s.h2}>Como fazer</Text>
              {pe.instructions.map((t, i) => (
                <View key={t} style={s.step}>
                  <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
                  <Text style={s.stepText}>{t}</Text>
                </View>
              ))}
            </>
          )}

          <Text style={[s.h2, { marginTop: 28 }]}>Recorde pessoal</Text>
          <View style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={s.prValue}>{fmt(best)}</Text>
              <Text style={s.prUnit}> kg</Text>
            </View>
            <Text style={s.hint}>
              {best == null ? 'Nenhum recorde ainda. Registre abaixo ou finalize um treino com cargas.' : 'Sua maior carga neste exercício.'}
            </Text>
            <Input label="Nova carga" placeholder="0" suffix="kg" keyboardType="decimal-pad" value={load} onChangeText={setLoad} />
            {recordError && <Text style={s.error}>{recordError}</Text>}
            <Button title="Registrar recorde" loadingTitle="Salvando..." loading={recordSaving} onPress={saveRecord} />
            {mine.slice(0, 3).map((r) => (
              <View key={r.id} style={s.prRow}>
                <Text style={s.prDate}>{dateOnly(r.recordedOn)}</Text>
                <Text style={s.prRowValue}>{fmt(r.weightKg)} kg</Text>
              </View>
            ))}
          </View>

          <Text style={[s.h2, { marginTop: 28 }]}>Minhas anotações</Text>
          <TextInput
            style={s.noteInput}
            value={noteValue}
            onChangeText={(v) => { setNote(v); setNoteMsg(null); }}
            placeholder="Ajuste de banco, pegada, sensações..."
            placeholderTextColor={colors.placeholder}
            multiline
            textAlignVertical="top"
          />
          {noteMsg && <Text style={[s.hint, { marginTop: 8 }]}>{noteMsg}</Text>}
          <View style={{ marginTop: 12 }}>
            <Button title="Salvar anotação" loadingTitle="Salvando..." loading={noteSaving} onPress={saveNote} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 10 }}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  statsCard: { flexDirection: 'row', backgroundColor: colors.cream, borderRadius: radius.card, paddingVertical: 14, paddingHorizontal: 4, marginTop: 4 },
  vline: { width: 1, backgroundColor: colors.line, opacity: 0.5 },
  statLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.muted },
  statValue: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, marginTop: 4 },
  tip: { backgroundColor: colors.creamLight, borderRadius: radius.card, padding: 14, marginTop: 14 },
  tipTitle: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.primary, marginBottom: 4 },
  tipText: { fontFamily: fonts.body, fontSize: 13, color: colors.text, lineHeight: 19 },
  h2: { fontFamily: fonts.heading, fontSize: 24, color: colors.text, marginTop: 24, marginBottom: 10 },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 12 },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontFamily: fonts.bodyHeavy, fontSize: 12, color: colors.white },
  stepText: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.text, lineHeight: 20, paddingTop: 2 },
  card: { backgroundColor: colors.creamLight, borderRadius: radius.card, padding: 16 },
  prValue: { fontFamily: fonts.heading, fontSize: 36, color: colors.primary },
  prUnit: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.muted },
  hint: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2, marginBottom: 14 },
  error: { fontFamily: fonts.body, fontSize: 12, color: colors.error, marginBottom: 12 },
  prRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.cream, marginTop: 8 },
  prDate: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  prRowValue: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text },
  noteInput: {
    minHeight: 110, borderRadius: radius.card, backgroundColor: colors.creamLight, borderWidth: 1, borderColor: colors.line,
    padding: 14, fontFamily: fonts.body, fontSize: 14, color: colors.text,
  },
});
