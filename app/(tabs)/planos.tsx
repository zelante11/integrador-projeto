import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Chip from '../../src/components/Chip';
import { planIcon } from '../../src/data/planMeta';
import { useData } from '../../src/state/DataProvider';
import { PlanSlug } from '../../src/types';
import { colors, fonts, radius } from '../../src/theme';

export default function Planos() {
  const { plans, profile, updateProfile } = useData();
  const [busy, setBusy] = useState<PlanSlug | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function select(slug: PlanSlug) {
    setError(null);
    setBusy(slug);
    try {
      await updateProfile({ selectedPlan: slug });
    } catch {
      setError('Não foi possível trocar de plano. Tente novamente.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Planos</Text>
        <Text style={s.sub}>Escolha o plano que guia o seu treino.</Text>
        {error && <Text style={s.error}>{error}</Text>}

        {plans.map((p) => {
          const active = p.slug === profile.selectedPlan;
          const recommended = p.slug === profile.recommendedPlan;
          return (
            <View key={p.slug} style={[s.card, active && s.cardActive]}>
              {p.heroImageUrl && <Image source={{ uri: p.heroImageUrl }} style={s.image} contentFit="cover" transition={200} />}
              <View style={s.body}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={s.icon}><Ionicons name={planIcon(p.slug)} size={20} color={colors.white} /></View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.name}>{p.label}</Text>
                    <Text style={s.freq}>{p.frequency}</Text>
                  </View>
                  {active ? (
                    <View style={s.badge}><Text style={s.badgeText}>Plano atual</Text></View>
                  ) : recommended ? (
                    <View style={[s.badge, s.badgeSoft]}><Text style={[s.badgeText, { color: colors.text }]}>Recomendado</Text></View>
                  ) : null}
                </View>
                <Text style={s.desc}>{p.description}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
                  {p.badges.map((b) => <Chip key={b} label={b} />)}
                </View>
                <View style={s.actions}>
                  <Pressable hitSlop={8}
                    onPress={() => router.push({ pathname: '/plano/[slug]', params: { slug: p.slug } })}>
                    <Text style={s.link}>Ver treinos</Text>
                  </Pressable>
                  {!active && (
                    <Pressable style={s.setBtn} disabled={busy !== null} onPress={() => select(p.slug)}>
                      <Text style={s.setBtnText}>{busy === p.slug ? 'Salvando...' : 'Definir como plano'}</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: fonts.heading, fontSize: 32, color: colors.text },
  sub: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: 20 },
  error: { fontFamily: fonts.body, fontSize: 12, color: colors.error, marginBottom: 12 },
  card: { backgroundColor: colors.creamLight, borderRadius: radius.card, marginBottom: 16, borderWidth: 1, borderColor: 'transparent', overflow: 'hidden' },
  cardActive: { borderColor: colors.line, backgroundColor: colors.cream },
  image: { width: '100%', height: 130, backgroundColor: colors.cream },
  body: { padding: 16 },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: fonts.heading, fontSize: 22, color: colors.text },
  freq: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
  badge: { backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeSoft: { backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.line },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.white },
  desc: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 12, lineHeight: 19 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  link: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primary },
  setBtn: { backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 16, height: 36, alignItems: 'center', justifyContent: 'center' },
  setBtnText: { fontFamily: fonts.bodyHeavy, fontSize: 12, color: colors.text },
});
