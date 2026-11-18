import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../../src/state/DataProvider';
import { colors, fonts, radius } from '../../src/theme';

export default function Metas() {
  const { goals, workouts, profile, updateProfile } = useData();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Metas</Text>
        <Text style={s.sub}>Escolha o objetivo que guia o seu plano de treino.</Text>

        {goals.map((g) => {
          const active = g.id === profile.goalId;
          const count = workouts.filter((w) => w.goalId === g.id).length;
          return (
            <View key={g.id} style={[s.card, active && s.cardActive]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={s.icon}><Ionicons name={g.icon as any} size={22} color={colors.white} /></View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.name}>{g.name}</Text>
                  <Text style={s.count}>{count} treinos no plano</Text>
                </View>
                {active && <View style={s.badge}><Text style={s.badgeText}>Meta atual</Text></View>}
              </View>
              <Text style={s.desc}>{g.description}</Text>
              <View style={s.actions}>
                <Pressable onPress={() => router.push({ pathname: '/plano', params: { goal: g.id } })} hitSlop={8}>
                  <Text style={s.link}>Ver treinos</Text>
                </Pressable>
                {!active && (
                  <Pressable style={s.setBtn} onPress={() => updateProfile({ goalId: g.id })}>
                    <Text style={s.setBtnText}>Definir como meta</Text>
                  </Pressable>
                )}
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
  card: { backgroundColor: colors.creamLight, borderRadius: radius.card, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'transparent' },
  cardActive: { borderColor: colors.line, backgroundColor: colors.cream },
  icon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: fonts.heading, fontSize: 22, color: colors.text },
  count: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
  badge: { backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.white },
  desc: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 12, lineHeight: 19 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  link: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primary },
  setBtn: { backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 16, height: 36, alignItems: 'center', justifyContent: 'center' },
  setBtnText: { fontFamily: fonts.bodyHeavy, fontSize: 12, color: colors.text },
});
