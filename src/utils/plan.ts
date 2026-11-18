import { OrderOverride, PlanExercise } from '../types';

export type DayGroup = { day: string; items: PlanExercise[] };

// Aplica a ordem personalizada do usuário aos exercícios do plano.
// Sem personalização, vale a ordem original (plan_exercises.position).
export function orderExercises(all: PlanExercise[], overrides: OrderOverride[]) {
  const map = new Map(overrides.map((o) => [o.planExerciseId, o]));
  const key = (e: PlanExercise) => map.get(e.id)?.position ?? e.position;
  const sorted = [...all].sort((a, b) => key(a) - key(b) || a.id - b.id);
  return {
    active: sorted.filter((e) => !map.get(e.id)?.removed),
    removed: sorted.filter((e) => map.get(e.id)?.removed),
  };
}

// Agrupa por dia de treino (ex.: "Treino A"), mantendo a ordem de aparição.
export function groupByDay(list: PlanExercise[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const e of list) {
    const g = groups.find((x) => x.day === e.dayLabel);
    if (g) g.items.push(e);
    else groups.push({ day: e.dayLabel, items: [e] });
  }
  return groups;
}

// Gera as posições completas (0..n-1) a partir dos grupos e dos removidos.
export function toOverrides(groups: DayGroup[], removed: PlanExercise[]): OrderOverride[] {
  const out: OrderOverride[] = [];
  let pos = 0;
  for (const g of groups) for (const e of g.items) out.push({ planExerciseId: e.id, position: pos++, removed: false });
  for (const e of removed) out.push({ planExerciseId: e.id, position: pos++, removed: true });
  return out;
}
