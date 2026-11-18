import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../src/components/Header';
import Button from '../../src/components/Button';
import Chip from '../../src/components/Chip';
import Loading from '../../src/components/Loading';
import { planIcon } from '../../src/data/planMeta';
import { db } from '../../src/services/db';
import { useData } from '../../src/state/DataProvider';
import { PlanExercise, PlanSlug } from '../../src/types';
import { restLabel } from '../../src/utils/format';
import { DayGroup, groupByDay, orderExercises, toOverrides } from '../../src/utils/plan';
import { useAsync } from '../../src/utils/useAsync';
import { colors, fonts, radius } from '../../src/theme';

export default function Plano() {
  const { slug } = useLocalSearchParams<{ slug: PlanSlug }>();
  const { selectedPlan, updateProfile } = useData();
  const plan = useAsync(() => db.getPlan(slug), [slug]);
  const order = useAsync(() => db.getPlanOrder(slug), [slug]);

  const [editing, setEditing] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (plan.error || order.error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
        <Header title="Plano" />
        <Loading error={plan.error ?? order.error} onRetry={() => { plan.reload(); order.reload(); }} />
      </SafeAreaView>
    );
  }
  if (!plan.data || !order.data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
        <Header title="Plano" />
        <Loading />
      </SafeAreaView>
    );
  }

  const p = plan.data;
  const isActive = selectedPlan?.slug === p.slug;

  // Ordem dos dias = ordem original do plano; ordem dos exercícios = personalizada (se houver).
  const dayOrder = groupByDay(p.exercises).map((g) => g.day);
  const sortDays = (g: DayGroup[]) => [...g].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
  const { active, removed } = orderExercises(p.exercises, order.data);
  const groups = sortDays(groupByDay(active));
  const customized = order.data.length > 0;

  async function persist(next: DayGroup[], nextRemoved: PlanExercise[]) {
    const overrides = toOverrides(sortDays(next), nextRemoved);
    order.setData(overrides); // atualiza a tela na hora
    setError(null);
    try {
      await db.savePlanOrder(overrides);
    } catch {
      setError('Não foi possível salvar a ordem. Tente novamente.');
      order.reload();
    }
  }

  function move(day: string, idx: number, dir: -1 | 1) {
    const next = groups.map((g) => {
      if (g.day !== day) return g;
      const items = [...g.items];
      const j = idx + dir;
      if (j < 0 || j >= items.length) return g;
      [items[idx], items[j]] = [items[j], items[idx]];
      return { ...g, items };
    });
    persist(next, removed);
  }

  function remove(e: PlanExercise) {
    const next = groups
      .map((g) => ({ ...g, items: g.items.filter((x) => x.id !== e.id) }))
      .filter((g) => g.items.length > 0);
    persist(next, [...removed, e]);
  }

  function restore(e: PlanExercise) {
    const next = groups.map((g) => ({ ...g, items: [...g.items] }));
    const g = next.find((x) => x.day === e.dayLabel);
    if (g) g.items.push(e);
    else next.push({ day: e.dayLabel, items: [e] });
    persist(next, removed.filter((x) => x.id !== e.id));
  }

  async function resetOrder() {
    setError(null);
    try {
      await db.resetPlanOrder(p.slug);
      order.setData([]);
    } catch {
      setError('Não foi possível restaurar a ordem. Tente novamente.');
    }
  }

  async function selectPlan() {
    setError(null);
    setSelecting(true);
    try {
      await updateProfile({ selectedPlan: p.slug });
    } catch {
      setError('Não foi possível trocar de plano. Tente novamente.');
    } finally {
      setSelecting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <Header
        title={isActive ? 'Seu plano' : 'Plano'}
        right={
          <Pressable onPress={() => setEditing((v) => !v)} hitSlop={10}>
            <Text style={s.headerAction}>{editing ? 'Concluir' : 'Personalizar'}</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 8, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {p.heroImageUrl && <Image source={{ uri: p.heroImageUrl }} style={s.hero} contentFit="cover" transition={200} />}

        <View style={s.intro}>
          <View style={s.icon}><Ionicons name={planIcon(p.slug)} size={24} color={colors.white} /></View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={s.planName}>{p.label}</Text>
            <Text style={s.planDesc}>{p.title}</Text>
          </View>
        </View>

        <Text style={s.body}>{p.description}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
          {p.badges.map((b) => <Chip key={b} label={b} />)}
        </View>

        <View style={s.facts}>
          <Fact icon="calendar-outline" label="Frequência" value={p.frequency} />
          <Fact icon="flag-outline" label="Objetivo" value={p.objective} />
        </View>

        {!isActive && (
          <View style={{ marginTop: 16 }}>
            <Button title="Definir como meu plano" loadingTitle="Salvando..." loading={selecting} onPress={selectPlan} />
          </View>
        )}
        {error && <Text style={s.error}>{error}</Text>}

        <Text style={[s.h2, { marginTop: 28 }]}>Treinos da semana</Text>
        {editing && (
          <Text style={s.hint}>Use as setas para mudar a ordem ou remova o que não quiser fazer. Você pode restaurar depois.</Text>
        )}

        {groups.map((g) => (
          <View key={g.day} style={s.dayCard}>
            <View style={s.dayHead}>
              <Text style={s.dayName}>{g.day}</Text>
              <Text style={s.dayCount}>{g.items.length} {g.items.length === 1 ? 'exercício' : 'exercícios'}</Text>
            </View>

            {g.items.map((e, i) => (
              <Pressable key={e.id} style={s.exRow} disabled={editing}
                onPress={() => router.push({ pathname: '/exercicio/[id]', params: { id: String(e.id) } })}>
                <View style={s.exNum}><Text style={s.exNumText}>{i + 1}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.exName}>{e.exercise.name}</Text>
                  <Text style={s.exMeta}>
                    {e.sets} x {e.reps} · descanso {restLabel(e.restSeconds)}
                    {e.exercise.equipment ? ` · ${e.exercise.equipment}` : ''}
                  </Text>
                </View>
                {editing ? (
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <IconBtn name="arrow-up" disabled={i === 0} onPress={() => move(g.day, i, -1)} />
                    <IconBtn name="arrow-down" disabled={i === g.items.length - 1} onPress={() => move(g.day, i, 1)} />
                    <IconBtn name="trash-outline" onPress={() => remove(e)} />
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                )}
              </Pressable>
            ))}

            {!editing && (
              <View style={{ marginTop: 12 }}>
                <Button title="Iniciar treino"
                  onPress={() => router.push({ pathname: '/treino', params: { slug: p.slug, day: g.day } })} />
              </View>
            )}
          </View>
        ))}

        {editing && removed.length > 0 && (
          <View style={s.dayCard}>
            <Text style={s.dayName}>Removidos</Text>
            {removed.map((e) => (
              <View key={e.id} style={s.exRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.exName, { color: colors.muted }]}>{e.exercise.name}</Text>
                  <Text style={s.exMeta}>{e.dayLabel}</Text>
                </View>
                <Pressable onPress={() => restore(e)} hitSlop={8}>
                  <Text style={s.headerAction}>Restaurar</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {editing && customized && (
          <Pressable style={s.reset} onPress={resetOrder}>
            <Ionicons name="refresh" size={16} color={colors.primary} />
            <Text style={s.headerAction}>Restaurar ordem original</Text>
          </Pressable>
        )}

        {p.warmup.length > 0 && <Bullets title="Aquecimento" items={p.warmup} />}
        {p.recovery.length > 0 && <Bullets title="Pós-treino" items={p.recovery} />}

        {(p.nutritionFood || p.nutritionSupplement) && (
          <View style={{ marginTop: 28 }}>
            <Text style={s.h2}>Alimentação e suplementos</Text>
            {p.nutritionFood && (
              <View style={s.note}>
                <Text style={s.noteTitle}>O que comer</Text>
                <Text style={s.noteText}>{p.nutritionFood}</Text>
              </View>
            )}
            {p.nutritionSupplement && (
              <View style={s.note}>
                <Text style={s.noteTitle}>Suplementos</Text>
                <Text style={s.noteText}>{p.nutritionSupplement}</Text>
              </View>
            )}
            <Text style={s.hint}>
              Informações gerais, sem substituir a orientação de um nutricionista ou médico.
            </Text>
          </View>
        )}

        {p.faqs.length > 0 && (
          <View style={{ marginTop: 28 }}>
            <Text style={s.h2}>Perguntas frequentes</Text>
            {p.faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <Pressable key={f.question} style={s.faq} onPress={() => setOpenFaq(open ? null : i)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={s.faqQ}>{f.question}</Text>
                    <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
                  </View>
                  {open && <Text style={s.faqA}>{f.answer}</Text>}
                </Pressable>
              );
            })}
          </View>
        )}

        {p.sources.length > 0 && (
          <View style={{ marginTop: 28 }}>
            <Text style={s.h2}>Fontes</Text>
            {p.sources.map((src) => (
              <Pressable key={src.url} style={s.source} onPress={() => Linking.openURL(src.url)}>
                <Text style={s.sourceText}>{src.label}</Text>
                <Ionicons name="open-outline" size={16} color={colors.primary} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Fact({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={s.fact}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={s.factLabel}>{label}</Text>
        <Text style={s.factValue}>{value}</Text>
      </View>
    </View>
  );
}

function Bullets({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={{ marginTop: 28 }}>
      <Text style={s.h2}>{title}</Text>
      {items.map((t) => (
        <View key={t} style={s.bullet}>
          <View style={s.dot} />
          <Text style={s.bulletText}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

function IconBtn({ name, onPress, disabled }: { name: keyof typeof Ionicons.glyphMap; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={4} style={[s.iconBtn, disabled && { opacity: 0.35 }]}>
      <Ionicons name={name} size={16} color={colors.text} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  headerAction: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.primary },
  hero: { width: '100%', height: 170, borderRadius: radius.card, backgroundColor: colors.cream, marginBottom: 16 },
  intro: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cream, borderRadius: radius.card, padding: 16, marginBottom: 14 },
  icon: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  planName: { fontFamily: fonts.heading, fontSize: 26, color: colors.text },
  planDesc: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  body: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, lineHeight: 20 },
  facts: { marginTop: 8, backgroundColor: colors.creamLight, borderRadius: radius.card, padding: 14, gap: 12 },
  fact: { flexDirection: 'row', alignItems: 'flex-start' },
  factLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.muted },
  factValue: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text, marginTop: 2, lineHeight: 18 },
  error: { fontFamily: fonts.body, fontSize: 12, color: colors.error, textAlign: 'center', marginTop: 12 },
  h2: { fontFamily: fonts.heading, fontSize: 24, color: colors.text, marginBottom: 10 },
  hint: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginBottom: 12, lineHeight: 18 },
  dayCard: { backgroundColor: colors.creamLight, borderRadius: radius.card, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.cream },
  dayHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 },
  dayName: { fontFamily: fonts.heading, fontSize: 22, color: colors.text },
  dayCount: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.primary },
  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.cream, gap: 12 },
  exNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  exNumText: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.primary },
  exName: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  exMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 2 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  reset: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 7, marginRight: 10 },
  bulletText: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.text, lineHeight: 20 },
  note: { backgroundColor: colors.creamLight, borderRadius: radius.card, padding: 14, marginBottom: 10 },
  noteTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.primary, marginBottom: 4 },
  noteText: { fontFamily: fonts.body, fontSize: 13, color: colors.text, lineHeight: 20 },
  faq: { backgroundColor: colors.creamLight, borderRadius: radius.card, padding: 14, marginBottom: 10 },
  faqQ: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 13, color: colors.text, paddingRight: 8 },
  faqA: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 8, lineHeight: 19 },
  source: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.cream },
  sourceText: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text, paddingRight: 8 },
});
