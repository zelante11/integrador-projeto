import { PersonalRecord, WorkoutLog } from '../types';
import { shortDate } from './format';

export type Stats = {
  maxLoad: number | null;                      // maior carga já registrada (kg)
  recordCount: number;                         // exercícios com recorde pessoal
  series: { label: string; value: number }[];  // maior carga por treino, em ordem cronológica
};

export function computeStats(logs: WorkoutLog[], records: PersonalRecord[]): Stats {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  let maxLoad = 0;
  const series: Stats['series'] = [];

  for (const log of sorted) {
    let sessionMax = 0;
    for (const ex of log.exercises) for (const set of ex.sets) if (set.load > sessionMax) sessionMax = set.load;
    if (sessionMax > maxLoad) maxLoad = sessionMax;
    if (sessionMax > 0) series.push({ label: shortDate(log.date), value: sessionMax });
  }
  for (const r of records) if (r.weightKg > maxLoad) maxLoad = r.weightKg;

  const recordCount = new Set(records.map((r) => r.exerciseId)).size;
  return { maxLoad: maxLoad > 0 ? maxLoad : null, recordCount, series };
}

// Melhor recorde (maior carga) de cada exercício.
export function bestRecords(records: PersonalRecord[]): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>();
  for (const r of records) {
    const cur = best.get(r.exerciseId);
    if (!cur || r.weightKg > cur.weightKg) best.set(r.exerciseId, r);
  }
  return [...best.values()].sort((a, b) => b.weightKg - a.weightKg);
}
