import { WorkoutLog } from '../types';
import { shortDate } from './format';

export type Stats = {
  maxLoad: number | null;               // maior carga já registrada (kg)
  recordCount: number;                  // exercícios com carga registrada
  series: { label: string; value: number }[]; // maior carga por treino, em ordem cronológica
};

export function computeStats(logs: WorkoutLog[]): Stats {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  let maxLoad = 0;
  const best = new Set<string>();
  const series: Stats['series'] = [];

  for (const log of sorted) {
    let sessionMax = 0;
    for (const ex of log.exercises) {
      for (const set of ex.sets) {
        if (set.load > 0) {
          best.add(ex.exerciseId);
          if (set.load > sessionMax) sessionMax = set.load;
        }
      }
    }
    if (sessionMax > maxLoad) maxLoad = sessionMax;
    if (sessionMax > 0) series.push({ label: shortDate(log.date), value: sessionMax });
  }
  return { maxLoad: maxLoad > 0 ? maxLoad : null, recordCount: best.size, series };
}
