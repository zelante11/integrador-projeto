import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../src/components/Header';
import Button from '../src/components/Button';
import { useData } from '../src/state/DataProvider';
import { colors, fonts, radius } from '../src/theme';
import { fmt, longDate } from '../src/utils/format';

export default function Historico() {
  const { logs, selectedPlan } = useData();
  const { prs } = useLocalSearchParams<{ prs?: string }>();

  // Recordes batidos no treino que acabou de ser finalizado: "Supino reto|60;Leg press|180"
  const newRecords = (prs ?? '').split(';').filter(Boolean).map((x) => x.split('|') as [string, string]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Header title="Histórico" />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {newRecords.length > 0 && (
          <View style={s.pr}>
            <View style={s.prHead}>
              <Ionicons name="trophy" size={20} color={colors.primary} />
              <Text style={s.prTitle}>{newRecords.length === 1 ? 'Novo recorde pessoal!' : 'Novos recordes pessoais!'}</Text>
            </View>
            {newRecords.map(([name, kg]) => (
              <View key={name} style={s.prRow}>
                <Text style={s.prName}>{name}</Text>
                <Text style={s.prKg}>{fmt(Number(kg))} kg</Text>
              </View>
            ))}
          </View>
        )}

        {logs.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={s.emptyTitle}>Nenhum treino registrado</Text>
            <Text style={s.emptySub}>Quando você finalizar um treino, ele aparece aqui.</Text>
            <Button pill title="Ver meu plano"
              onPress={() => selectedPlan
                ? router.replace({ pathname: '/plano/[slug]', params: { slug: selectedPlan.slug } })
                : router.replace('/planos')} />
          </View>
        ) : (
          logs.map((log) => (
            <View key={log.id} style={s.card}>
              <Text style={s.date}>{longDate(log.date)}</Text>
              <Text style={s.name}>{log.workoutName}</Text>
              {log.exercises.map((e) => {
                const top = Math.max(0, ...e.sets.map((x) => x.load));
                return (
                  <View key={e.exerciseId} style={s.line}>
                    <Text style={s.exName}>{e.exerciseName}</Text>
                    <Text style={s.exInfo}>
                      {e.sets.length} {e.sets.length === 1 ? 'série' : 'séries'}{top > 0 ? ` · até ${fmt(top)} kg` : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  pr: { backgroundColor: colors.cream, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, padding: 16, marginBottom: 16 },
  prHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  prTitle: { fontFamily: fonts.heading, fontSize: 22, color: colors.text },
  prRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  prName: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text },
  prKg: { fontFamily: fonts.heading, fontSize: 18, color: colors.primary },
  card: { backgroundColor: colors.creamLight, borderRadius: radius.card, padding: 16, marginBottom: 14 },
  date: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.primary },
  name: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, marginBottom: 8 },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.cream },
  exName: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.text },
  exInfo: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  emptyTitle: { fontFamily: fonts.heading, fontSize: 24, color: colors.text, marginBottom: 6 },
  emptySub: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginBottom: 24, textAlign: 'center' },
});
