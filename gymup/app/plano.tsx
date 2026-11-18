import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../src/components/Header';
import Button from '../src/components/Button';
import { useData } from '../src/state/DataProvider';
import { colors, fonts, radius } from '../src/theme';

export default function Plano() {
  const { goal: goalParam } = useLocalSearchParams<{ goal?: string }>();
  const { goals, workouts, profile, updateProfile } = useData();
  const goalId = goalParam ?? profile.goalId;
  const goal = goals.find((g) => g.id === goalId) ?? goals[0];
  const list = workouts.filter((w) => w.goalId === goal.id);
  const isActive = goal.id === profile.goalId;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Header title={isActive ? 'Seu plano' : 'Plano'} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <View style={s.icon}><Ionicons name={goal.icon as any} size={24} color={colors.white} /></View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={s.goalName}>{goal.name}</Text>
            <Text style={s.goalDesc}>{goal.description}</Text>
          </View>
        </View>

        {!isActive && (
          <View style={{ marginBottom: 16 }}>
            <Button title="Definir como minha meta" onPress={() => updateProfile({ goalId: goal.id })} />
          </View>
        )}

        <Text style={s.h2}>Treinos da semana</Text>
        {list.map((w) => (
          <Pressable key={w.id} style={s.card}
            onPress={() => router.push({ pathname: '/treino/[id]', params: { id: w.id } })}>
            <View style={{ flex: 1 }}>
              <Text style={s.wName}>{w.name}</Text>
              <Text style={s.wFocus}>{w.focus}</Text>
              <Text style={s.wMeta}>{w.exercises.length} exercícios</Text>
            </View>
            <View style={s.go}><Ionicons name="play" size={16} color={colors.white} /></View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cream, borderRadius: radius.card, padding: 16, marginBottom: 20 },
  icon: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  goalName: { fontFamily: fonts.heading, fontSize: 26, color: colors.text },
  goalDesc: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  h2: { fontFamily: fonts.heading, fontSize: 22, color: colors.text, marginBottom: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.creamLight, borderRadius: radius.card, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.cream },
  wName: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.primary },
  wFocus: { fontFamily: fonts.heading, fontSize: 22, color: colors.text },
  wMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 2 },
  go: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
