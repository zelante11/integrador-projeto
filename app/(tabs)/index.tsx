import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../../src/components/Logo';
import Button from '../../src/components/Button';
import LoadChart from '../../src/components/LoadChart';
import { planIcon } from '../../src/data/planMeta';
import { db } from '../../src/services/db';
import { useData } from '../../src/state/DataProvider';
import { colors, fonts, radius } from '../../src/theme';
import { fmt, show } from '../../src/utils/format';
import { groupByDay } from '../../src/utils/plan';
import { useAsync } from '../../src/utils/useAsync';

export default function Home() {
  const { profile, selectedPlan, recommendedPlan, settings, stats, logs } = useData();
  const slug = selectedPlan?.slug ?? null;
  const plan = useAsync(() => (slug ? db.getPlan(slug) : Promise.resolve(null)), [slug]);

  // Próximo treino = o dia seguinte ao último registrado neste plano.
  const days = plan.data ? groupByDay(plan.data.exercises).map((g) => g.day) : [];
  const last = logs.find((l) => l.planSlug === slug && l.dayLabel);
  const lastIdx = last?.dayLabel ? days.indexOf(last.dayLabel) : -1;
  const nextDay = days.length ? days[(lastIdx + 1) % days.length] : null;

  const firstName = profile.name.trim().split(' ')[0];
  const suggest = recommendedPlan && recommendedPlan.slug !== slug ? recommendedPlan : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Logo size={30} />
          <Pressable style={s.avatar} onPress={() => router.navigate('/perfil')}>
            <Ionicons name="person-outline" size={20} color={colors.text} />
          </Pressable>
        </View>

        <Text style={s.hello}>Olá, {firstName}!</Text>
        <Text style={s.sub}>Vamos acompanhar sua evolução?</Text>

        <Text style={s.h2}>Seu plano atual</Text>
        {selectedPlan ? (
          <View style={s.planCard}>
            <View style={{ flexDirection: 'row', marginBottom: 14 }}>
              <View style={s.planIcon}><Ionicons name={planIcon(selectedPlan.slug)} size={20} color={colors.white} /></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.planName}>{selectedPlan.label}</Text>
                <Text style={s.planDesc}>{selectedPlan.title}</Text>
              </View>
            </View>
            <Button title="Ver meu plano"
              onPress={() => router.push({ pathname: '/plano/[slug]', params: { slug: selectedPlan.slug } })} />
          </View>
        ) : (
          <View style={s.planCard}>
            <Text style={s.planDesc}>Você ainda não escolheu um plano de treino.</Text>
            <View style={{ height: 12 }} />
            <Button title="Escolher um plano" onPress={() => router.navigate('/planos')} />
          </View>
        )}

        {nextDay && selectedPlan && (
          <Pressable style={s.next}
            onPress={() => router.push({ pathname: '/treino', params: { slug: selectedPlan.slug, day: nextDay } })}>
            <View style={{ flex: 1 }}>
              <Text style={s.nextLabel}>Próximo treino</Text>
              <Text style={s.nextDay}>{nextDay}</Text>
            </View>
            <View style={s.go}><Ionicons name="play" size={16} color={colors.white} /></View>
          </Pressable>
        )}

        {suggest && (
          <Pressable style={s.row}
            onPress={() => router.push({ pathname: '/plano/[slug]', params: { slug: suggest.slug } })}>
            <Text style={s.rowText}>Recomendado para você: {suggest.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </Pressable>
        )}

        <Pressable style={s.row} onPress={() => router.navigate('/planos')}>
          <Text style={s.rowText}>Explorar planos</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </Pressable>

        <Text style={[s.h2, { marginTop: 24 }]}>Sua evolução</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Stat label="Maior carga registrada" value={fmt(stats.maxLoad)} unit="kg" />
          <Stat label="Recordes pessoais" value={stats.recordCount ? show(stats.recordCount) : '—'} unit="exercícios" />
        </View>

        <View style={s.chartHead}>
          <Text style={s.chartTitle}>Carga registrada</Text>
          <Pressable onPress={() => router.push('/historico')} hitSlop={8}>
            <Text style={s.chartLink}>Ver histórico</Text>
          </Pressable>
        </View>
        <LoadChart data={stats.series} />

        {settings.assistantVisible && (
          <Pressable style={s.coach} onPress={() => router.push('/coach')}>
            <View style={{ flex: 1 }}>
              <Text style={s.coachTitle}>Converse com o CoachPro</Text>
              <Text style={s.coachSub}>Tire dúvidas sobre seus treinos</Text>
            </View>
            <View style={s.coachBtn}><Ionicons name="chatbubble-outline" size={22} color={colors.white} /></View>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statUnit}>{unit}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  hello: { fontFamily: fonts.heading, fontSize: 30, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginBottom: 24 },
  h2: { fontFamily: fonts.heading, fontSize: 20, color: colors.text, marginBottom: 12 },
  planCard: { backgroundColor: colors.creamLight, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 14 },
  planIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  planName: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  planDesc: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  next: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cream, borderRadius: radius.card, padding: 16, marginTop: 12 },
  nextLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.primary },
  nextDay: { fontFamily: fonts.heading, fontSize: 24, color: colors.text },
  go: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.creamLight, borderRadius: radius.card, padding: 16, marginTop: 12 },
  rowText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  stat: { flex: 1, backgroundColor: colors.creamLight, borderRadius: radius.card, padding: 12 },
  statLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.text },
  statValue: { fontFamily: fonts.heading, fontSize: 24, color: colors.text, marginVertical: 6 },
  statUnit: { fontFamily: fonts.body, fontSize: 10, color: colors.muted },
  chartHead: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  chartTitle: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.text },
  chartLink: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.primary },
  coach: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cream, borderRadius: 20, padding: 14, marginTop: 24 },
  coachTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  coachSub: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  coachBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
