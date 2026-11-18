import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/Screen';
import Logo from '../src/components/Logo';
import Button from '../src/components/Button';
import OptionChip from '../src/components/OptionChip';
import { ErrorText, Subtitle, Title } from '../src/components/Texts';
import { FREQUENCY_OPTIONS, GOAL_OPTIONS, LEVEL_OPTIONS, planIcon } from '../src/data/planMeta';
import { useData } from '../src/state/DataProvider';
import { colors, fonts } from '../src/theme';
import { ExperienceLevel, PlanSlug } from '../src/types';

// Primeiro acesso: objetivo, nível e frequência -> o banco calcula o plano recomendado (função complete_onboarding).
export default function Onboarding() {
  const { profile, completeOnboarding } = useData();
  const [goal, setGoal] = useState<PlanSlug>(profile.trainingGoal ?? 'iniciantes');
  const [level, setLevel] = useState<ExperienceLevel>(profile.experienceLevel ?? 'iniciante');
  const [frequency, setFrequency] = useState(
    FREQUENCY_OPTIONS.includes(profile.desiredFrequency) ? profile.desiredFrequency : 3,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await completeOnboarding({ goal, level, frequency });
      router.replace('/');
    } catch (e: any) {
      setError(e.message ?? 'Não foi possível salvar. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ marginTop: 8, marginBottom: 20 }}><Logo size={40} /></View>
      <Title style={{ textAlign: 'left' }}>Vamos montar o seu plano</Title>
      <Subtitle style={{ textAlign: 'left' }}>
        Responda três perguntas rápidas e indicaremos o plano que mais combina com você.
      </Subtitle>
      <ErrorText>{error}</ErrorText>

      <Text style={s.label}>Qual é o seu objetivo?</Text>
      <View style={{ marginBottom: 24 }}>
        {GOAL_OPTIONS.map((g) => {
          const on = goal === g.slug;
          return (
            <Pressable key={g.slug} style={[s.goal, on && s.goalOn]} onPress={() => setGoal(g.slug)}>
              <Ionicons name={planIcon(g.slug)} size={20} color={on ? colors.text : colors.primary} />
              <Text style={s.goalText}>{g.label}</Text>
              <View style={s.radio}>{on && <View style={s.dot} />}</View>
            </Pressable>
          );
        })}
      </View>

      <Text style={s.label}>Qual é a sua experiência?</Text>
      <View style={s.wrap}>
        {LEVEL_OPTIONS.map((l) => (
          <OptionChip key={l.value} label={l.label} on={level === l.value} onPress={() => setLevel(l.value)} />
        ))}
      </View>

      <Text style={[s.label, { marginTop: 12 }]}>Quantos dias por semana quer treinar?</Text>
      <View style={[s.wrap, { marginBottom: 28 }]}>
        {FREQUENCY_OPTIONS.map((n) => (
          <OptionChip key={n} label={`${n} dias`} on={frequency === n} onPress={() => setFrequency(n)} />
        ))}
      </View>

      <Button title="Ver meu plano recomendado" loadingTitle="Calculando..." loading={loading} onPress={onSubmit} />
    </Screen>
  );
}

const s = StyleSheet.create({
  label: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text, marginBottom: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  goal: {
    flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1,
    borderColor: colors.cream, backgroundColor: colors.creamLight, padding: 14, marginBottom: 10,
  },
  goalOn: { borderColor: colors.primary, backgroundColor: colors.cream },
  goalText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
