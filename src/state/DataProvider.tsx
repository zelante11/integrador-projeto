import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { db } from '../services/db';
import { ProfilePatch } from '../services/db/repository';
import {
  ExperienceLevel, Measures, MeasureEntry, NewWorkoutLog, PersonalRecord, PlanSlug, PlanSummary, Profile,
  Settings, WorkoutLog,
} from '../types';
import { computeStats, Stats } from '../utils/stats';
import { useAuth } from './AuthProvider';

type Loaded = {
  profile: Profile;
  settings: Settings;
  plans: PlanSummary[];
  records: PersonalRecord[];
  measures: MeasureEntry[]; // mais recentes primeiro
  logs: WorkoutLog[];
};

type DataCtx = {
  loaded: boolean;
  error: string | null;
  retry: () => void;
  data: Loaded | null;
};

type Actions = {
  selectedPlan: PlanSummary | null;
  recommendedPlan: PlanSummary | null;
  stats: Stats;
  refresh: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  completeOnboarding: (input: { goal: PlanSlug; level: ExperienceLevel; frequency: number }) => Promise<PlanSlug>;
  saveMeasures: (m: Measures) => Promise<void>;
  addRecord: (exerciseId: string, weightKg: number) => Promise<void>;
  addLog: (log: NewWorkoutLog) => Promise<{ log: WorkoutLog; newRecords: PersonalRecord[] }>;
};

const StateCtx = createContext<DataCtx | null>(null);

export function useDataStatus() {
  const c = useContext(StateCtx);
  if (!c) throw new Error('useDataStatus precisa estar dentro de <DataProvider>');
  return c;
}

const ActionsCtx = createContext<(Actions & Loaded) | null>(null);

// Para as telas do app (só renderizam depois que os dados carregaram).
export function useData() {
  const c = useContext(ActionsCtx);
  if (!c) throw new Error('Dados ainda não carregados.');
  return c;
}

async function loadAll(): Promise<Loaded> {
  const [profile, settings, plans, records, measures, logs] = await Promise.all([
    db.getProfile(), db.getSettings(), db.listPlans(), db.listRecords(), db.listMeasures(), db.listLogs(),
  ]);
  return { profile, settings, plans, records, measures, logs };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) {
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setError(null);
    loadAll()
      .then((d) => !cancelled && setData(d))
      .catch((e: Error) => !cancelled && setError(e.message || 'Não foi possível carregar seus dados.'));
    return () => { cancelled = true; };
  }, [userId, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const patch = useCallback((p: Partial<Loaded>) => setData((d) => (d ? { ...d, ...p } : d)), []);

  const stats = useMemo(() => computeStats(data?.logs ?? [], data?.records ?? []), [data?.logs, data?.records]);

  const status = useMemo<DataCtx>(() => ({ loaded: !!data, error, retry, data }), [data, error, retry]);

  const value = useMemo(() => {
    if (!data) return null;
    const bySlug = (s: PlanSlug | null) => data.plans.find((p) => p.slug === s) ?? null;
    const actions: Actions = {
      selectedPlan: bySlug(data.profile.selectedPlan),
      recommendedPlan: bySlug(data.profile.recommendedPlan),
      stats,
      refresh: async () => patch(await loadAll()),
      updateProfile: async (p) => patch({ profile: await db.updateProfile(p) }),
      updateSettings: async (p) => patch({ settings: await db.updateSettings(p) }),
      completeOnboarding: async (input) => {
        const slug = await db.completeOnboarding(input);
        patch({ profile: await db.getProfile() });
        return slug;
      },
      saveMeasures: async (m) => {
        const entry = await db.addMeasures(m);
        setData((d) => (d ? { ...d, measures: [entry, ...d.measures] } : d));
      },
      addRecord: async (exerciseId, weightKg) => {
        await db.addRecord(exerciseId, weightKg);
        patch({ records: await db.listRecords() });
      },
      addLog: async (log) => {
        const before = new Set(data.records.map((r) => r.id));
        const saved = await db.addLog(log);
        const [records, logs] = await Promise.all([db.listRecords(), db.listLogs()]);
        patch({ records, logs });
        return { log: saved, newRecords: records.filter((r) => !before.has(r.id)) };
      },
    };
    return { ...data, ...actions };
  }, [data, stats, patch]);

  return (
    <StateCtx.Provider value={status}>
      <ActionsCtx.Provider value={value}>{children}</ActionsCtx.Provider>
    </StateCtx.Provider>
  );
}
