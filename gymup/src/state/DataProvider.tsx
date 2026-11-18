import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { db } from '../services/db';
import { Goal, Measures, Profile, Workout, WorkoutLog } from '../types';
import { computeStats, Stats } from '../utils/stats';

type Loaded = { profile: Profile; measures: Measures; goals: Goal[]; workouts: Workout[]; logs: WorkoutLog[] };

type DataCtx = Loaded & {
  goal: Goal; // meta atual
  stats: Stats;
  refresh: () => Promise<void>;
  updateProfile: (patch: Partial<Omit<Profile, 'id'>>) => Promise<void>;
  saveMeasures: (m: Measures) => Promise<void>;
  addLog: (log: Omit<WorkoutLog, 'id'>) => Promise<WorkoutLog>;
};

const Ctx = createContext<DataCtx | null>(null);

export function useData() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useData precisa estar dentro de <DataProvider>');
  return c;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Loaded | null>(null);

  const refresh = useCallback(async () => {
    const [profile, measures, goals, workouts, logs] = await Promise.all([
      db.getProfile(), db.getMeasures(), db.listGoals(), db.listWorkouts(), db.listLogs(),
    ]);
    setData({ profile, measures, goals, workouts, logs });
  }, []);

  useEffect(() => { refresh().catch(console.warn); }, [refresh]);

  const stats = useMemo(() => computeStats(data?.logs ?? []), [data?.logs]);

  if (!data) return null;

  const value: DataCtx = {
    ...data,
    goal: data.goals.find((g) => g.id === data.profile.goalId) ?? data.goals[0],
    stats,
    refresh,
    updateProfile: async (patch) => {
      const profile = await db.updateProfile(patch);
      setData((d) => d && { ...d, profile });
    },
    saveMeasures: async (m) => {
      const measures = await db.saveMeasures(m);
      setData((d) => d && { ...d, measures });
    },
    addLog: async (log) => {
      const saved = await db.addLog(log);
      setData((d) => d && { ...d, logs: [saved, ...d.logs] });
      return saved;
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
