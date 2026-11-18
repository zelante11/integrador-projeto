import { mediaUrl } from '../../config';
import {
  ChatMessage, Exercise, ExperienceLevel, MEASURE_KEYS, MeasureEntry, MeasureKey, Measures, NewWorkoutLog,
  OrderOverride, PersonalRecord, PlanDetail, PlanExercise, PlanSlug, PlanSummary, Profile, Settings, WorkoutLog,
} from '../../types';
import type { Database } from '../database.types';
import { supabase } from '../supabase';
import { ProfilePatch, Repository } from './repository';

type Tables = Database['public']['Tables'];

// ---------- utilitários ----------

async function uid(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Sessão expirada. Entre novamente.');
  return data.session.user.id;
}

function fail(error: { message: string } | null): asserts error is null {
  if (error) throw new Error(error.message);
}

const MEASURE_COLUMNS: Record<MeasureKey, 'chest' | 'waist' | 'abdomen' | 'hip' | 'arm' | 'forearm' | 'thigh' | 'calf'> = {
  Peito: 'chest', Cintura: 'waist', Abdômen: 'abdomen', Quadril: 'hip',
  Braço: 'arm', Antebraço: 'forearm', Coxa: 'thigh', Panturrilha: 'calf',
};

// ---------- conversões linha do banco -> modelo do app ----------

const toProfile = (r: Tables['profiles']['Row']): Profile => ({
  id: r.id,
  name: r.name,
  email: r.email,
  age: r.age,
  weight: r.weight_kg,
  height: r.height_m,
  bodyFat: r.body_fat_pct,
  trainingGoal: r.training_goal_slug as PlanSlug | null,
  experienceLevel: r.experience_level as ExperienceLevel | null,
  desiredFrequency: r.desired_frequency,
  recommendedPlan: r.recommended_plan_slug as PlanSlug | null,
  selectedPlan: r.selected_plan_slug as PlanSlug | null,
  onboardingCompleted: r.onboarding_completed,
});

const toSettings = (r: Tables['user_settings']['Row']): Settings => ({
  reminders: r.reminders,
  weeklySummary: r.weekly_summary,
  assistantVisible: r.assistant_visible,
});

const toPlanSummary = (r: Tables['plans']['Row']): PlanSummary => ({
  slug: r.slug as PlanSlug,
  label: r.label,
  title: r.title,
  description: r.description,
  frequency: r.frequency,
  objective: r.objective,
  heroImageUrl: mediaUrl(r.hero_image_path),
  badges: r.badges,
});

const toExercise = (r: Tables['exercises']['Row']): Exercise => ({
  id: r.id,
  name: r.name,
  equipment: r.equipment,
  primaryMuscle: r.primary_muscle,
  videoUrl: mediaUrl(r.video_path),
});

type PlanExerciseJoined = Tables['plan_exercises']['Row'] & { exercises: Tables['exercises']['Row'] | null };

const toPlanExercise = (r: PlanExerciseJoined): PlanExercise => {
  if (!r.exercises) throw new Error('Exercício do plano sem cadastro no catálogo.');
  return {
    id: r.id,
    planSlug: r.plan_slug as PlanSlug,
    exercise: toExercise(r.exercises),
    dayLabel: r.day_label,
    sets: r.sets,
    reps: r.reps,
    restSeconds: r.rest_seconds,
    notes: r.notes,
    secondaryMuscle: r.secondary_muscle,
    difficulty: r.difficulty,
    instructions: r.instructions,
    position: r.position,
  };
};

const toMeasureEntry = (r: Tables['body_measurements']['Row']): MeasureEntry => ({
  id: r.id,
  measuredOn: r.measured_on,
  values: Object.fromEntries(MEASURE_KEYS.map((k) => [k, r[MEASURE_COLUMNS[k]]])) as Measures,
});

// ---------- implementação ----------

export const supabaseRepository: Repository = {
  // ----- perfil -----
  async getProfile() {
    const id = await uid();
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    fail(error);
    if (data) return toProfile(data);

    // Conta sem perfil (criada antes do trigger existir): cria agora.
    const { data: auth } = await supabase.auth.getUser();
    const meta = auth.user?.user_metadata ?? {};
    const created = await supabase
      .from('profiles')
      .insert({ id, name: (meta.name as string) || 'Atleta', email: auth.user?.email ?? null })
      .select('*')
      .single();
    fail(created.error);
    await supabase.from('user_settings').upsert({ user_id: id });
    return toProfile(created.data);
  },

  async updateProfile(patch: ProfilePatch) {
    const id = await uid();
    const row: Tables['profiles']['Update'] = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.age !== undefined) row.age = patch.age;
    if (patch.weight !== undefined) row.weight_kg = patch.weight;
    if (patch.height !== undefined) row.height_m = patch.height;
    if (patch.bodyFat !== undefined) row.body_fat_pct = patch.bodyFat;
    if (patch.trainingGoal !== undefined) row.training_goal_slug = patch.trainingGoal;
    if (patch.experienceLevel !== undefined) row.experience_level = patch.experienceLevel;
    if (patch.desiredFrequency !== undefined) row.desired_frequency = patch.desiredFrequency;
    if (patch.selectedPlan !== undefined) row.selected_plan_slug = patch.selectedPlan;
    const { data, error } = await supabase.from('profiles').update(row).eq('id', id).select('*').single();
    fail(error);
    return toProfile(data);
  },

  async completeOnboarding({ goal, level, frequency }) {
    const { data, error } = await supabase.rpc('complete_onboarding', {
      p_goal: goal, p_level: level, p_freq: frequency,
    });
    fail(error);
    return data as PlanSlug;
  },

  // ----- configurações -----
  async getSettings() {
    const id = await uid();
    const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', id).maybeSingle();
    fail(error);
    if (data) return toSettings(data);
    const created = await supabase.from('user_settings').insert({ user_id: id }).select('*').single();
    fail(created.error);
    return toSettings(created.data);
  },

  async updateSettings(patch) {
    const id = await uid();
    const row: Tables['user_settings']['Update'] = {};
    if (patch.reminders !== undefined) row.reminders = patch.reminders;
    if (patch.weeklySummary !== undefined) row.weekly_summary = patch.weeklySummary;
    if (patch.assistantVisible !== undefined) row.assistant_visible = patch.assistantVisible;
    const { data, error } = await supabase.from('user_settings').update(row).eq('user_id', id).select('*').single();
    fail(error);
    return toSettings(data);
  },

  // ----- planos -----
  async listPlans() {
    const { data, error } = await supabase.from('plans').select('*').order('position');
    fail(error);
    return data.map(toPlanSummary);
  },

  async getPlan(slug) {
    const [plan, faqs, sources, exercises] = await Promise.all([
      supabase.from('plans').select('*').eq('slug', slug).single(),
      supabase.from('plan_faqs').select('question, answer').eq('plan_slug', slug).order('position'),
      supabase.from('plan_sources').select('label, url').eq('plan_slug', slug).order('position'),
      supabase.from('plan_exercises').select('*, exercises(*)').eq('plan_slug', slug).order('position'),
    ]);
    fail(plan.error); fail(faqs.error); fail(sources.error); fail(exercises.error);
    return {
      ...toPlanSummary(plan.data),
      warmup: plan.data.warmup,
      recovery: plan.data.recovery,
      nutritionFood: plan.data.nutrition_food,
      nutritionSupplement: plan.data.nutrition_supplement,
      faqs: faqs.data,
      sources: sources.data,
      exercises: exercises.data.map((r) => toPlanExercise(r as PlanExerciseJoined)),
    } satisfies PlanDetail;
  },

  async getPlanExercise(id) {
    const { data, error } = await supabase.from('plan_exercises').select('*, exercises(*)').eq('id', id).single();
    fail(error);
    return toPlanExercise(data as PlanExerciseJoined);
  },

  // ----- ordem personalizada -----
  async getPlanOrder(slug) {
    const id = await uid();
    const { data, error } = await supabase
      .from('user_plan_exercises')
      .select('plan_exercise_id, position, removed, plan_exercises!inner(plan_slug)')
      .eq('user_id', id)
      .eq('plan_exercises.plan_slug', slug);
    fail(error);
    return data.map((r) => ({ planExerciseId: r.plan_exercise_id, position: r.position, removed: r.removed }));
  },

  async savePlanOrder(overrides) {
    if (overrides.length === 0) return;
    const id = await uid();
    const rows = overrides.map((o) => ({
      user_id: id, plan_exercise_id: o.planExerciseId, position: o.position, removed: o.removed,
    }));
    const { error } = await supabase.from('user_plan_exercises').upsert(rows, { onConflict: 'user_id,plan_exercise_id' });
    fail(error);
  },

  async resetPlanOrder(slug) {
    const id = await uid();
    const ids = await supabase.from('plan_exercises').select('id').eq('plan_slug', slug);
    fail(ids.error);
    if (ids.data.length === 0) return;
    const { error } = await supabase
      .from('user_plan_exercises')
      .delete()
      .eq('user_id', id)
      .in('plan_exercise_id', ids.data.map((r) => r.id));
    fail(error);
  },

  // ----- recordes e notas -----
  async listRecords() {
    const { data, error } = await supabase
      .from('personal_records')
      .select('id, exercise_id, weight_kg, recorded_on, exercises(name)')
      .order('recorded_on', { ascending: false })
      .order('id', { ascending: false });
    fail(error);
    return data.map((r): PersonalRecord => ({
      id: r.id,
      exerciseId: r.exercise_id,
      exerciseName: r.exercises?.name ?? r.exercise_id,
      weightKg: r.weight_kg,
      recordedOn: r.recorded_on,
    }));
  },

  async addRecord(exerciseId, weightKg) {
    const id = await uid();
    const { error } = await supabase.from('personal_records').insert({ user_id: id, exercise_id: exerciseId, weight_kg: weightKg });
    fail(error);
  },

  async getNote(exerciseId) {
    const id = await uid();
    const { data, error } = await supabase
      .from('exercise_notes').select('content').eq('user_id', id).eq('exercise_id', exerciseId).maybeSingle();
    fail(error);
    return data?.content ?? '';
  },

  async saveNote(exerciseId, content) {
    const id = await uid();
    const text = content.trim();
    if (!text) {
      const { error } = await supabase.from('exercise_notes').delete().eq('user_id', id).eq('exercise_id', exerciseId);
      fail(error);
      return;
    }
    const { error } = await supabase
      .from('exercise_notes')
      .upsert({ user_id: id, exercise_id: exerciseId, content: text }, { onConflict: 'user_id,exercise_id' });
    fail(error);
  },

  // ----- medidas corporais -----
  async listMeasures() {
    const { data, error } = await supabase
      .from('body_measurements').select('*').order('measured_on', { ascending: false }).order('id', { ascending: false }).limit(60);
    fail(error);
    return data.map(toMeasureEntry);
  },

  async addMeasures(values) {
    const id = await uid();
    const row: Tables['body_measurements']['Insert'] = { user_id: id };
    for (const k of MEASURE_KEYS) row[MEASURE_COLUMNS[k]] = values[k];
    const { data, error } = await supabase.from('body_measurements').insert(row).select('*').single();
    fail(error);
    return toMeasureEntry(data);
  },

  // ----- treinos realizados -----
  async listLogs() {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('id, plan_slug, day_label, workout_name, performed_at, set_logs(exercise_id, exercise_name, load_kg, reps, set_number)')
      .order('performed_at', { ascending: false })
      .limit(60);
    fail(error);
    return data.map((l): WorkoutLog => {
      const sets = [...l.set_logs].sort((a, b) => a.set_number - b.set_number);
      const byExercise = new Map<string, WorkoutLog['exercises'][number]>();
      for (const s of sets) {
        const key = s.exercise_id ?? s.exercise_name;
        const ex = byExercise.get(key) ?? { exerciseId: key, exerciseName: s.exercise_name, sets: [] };
        ex.sets.push({ load: s.load_kg, reps: s.reps });
        byExercise.set(key, ex);
      }
      return {
        id: l.id,
        planSlug: l.plan_slug as PlanSlug | null,
        dayLabel: l.day_label,
        workoutName: l.workout_name,
        date: l.performed_at,
        exercises: [...byExercise.values()],
      };
    });
  },

  async addLog(log: NewWorkoutLog) {
    const id = await uid();
    const created = await supabase
      .from('workout_logs')
      .insert({ user_id: id, plan_slug: log.planSlug, day_label: log.dayLabel, workout_name: log.workoutName, performed_at: log.date })
      .select('id')
      .single();
    fail(created.error);
    const logId = created.data.id;

    const rows = log.exercises.flatMap((ex) =>
      ex.sets.map((s, i) => ({
        log_id: logId, exercise_id: ex.exerciseId, exercise_name: ex.exerciseName,
        set_number: i + 1, load_kg: s.load, reps: s.reps,
      })),
    );
    if (rows.length > 0) {
      const { error } = await supabase.from('set_logs').insert(rows);
      if (error) {
        await supabase.from('workout_logs').delete().eq('id', logId); // não deixa treino pela metade
        throw new Error(error.message);
      }
    }

    // Novo recorde pessoal: carga maior que o melhor já registrado do exercício.
    const best = new Map(log.exercises.map((ex) => [ex.exerciseId, Math.max(0, ...ex.sets.map((s) => s.load))]));
    const ids = [...best.keys()];
    if (ids.length > 0) {
      const current = await supabase.from('personal_records').select('exercise_id, weight_kg').in('exercise_id', ids);
      fail(current.error);
      const top = new Map<string, number>();
      for (const r of current.data) top.set(r.exercise_id, Math.max(top.get(r.exercise_id) ?? 0, r.weight_kg));
      const prs = [...best.entries()]
        .filter(([exId, load]) => load > 0 && load > (top.get(exId) ?? 0))
        .map(([exId, load]) => ({ user_id: id, exercise_id: exId, weight_kg: load }));
      if (prs.length > 0) await supabase.from('personal_records').insert(prs);
    }

    return { ...log, id: logId };
  },

  // ----- CoachPro -----
  async getChat() {
    const id = await uid();
    const last = await supabase
      .from('chat_conversations').select('id').eq('user_id', id).order('updated_at', { ascending: false }).limit(1).maybeSingle();
    fail(last.error);
    let conversationId = last.data?.id;
    if (!conversationId) {
      const created = await supabase.from('chat_conversations').insert({ user_id: id }).select('id').single();
      fail(created.error);
      conversationId = created.data.id;
    }
    const { data, error } = await supabase
      .from('chat_messages').select('id, role, content, created_at').eq('conversation_id', conversationId)
      .order('created_at', { ascending: true }).limit(100);
    fail(error);
    return {
      conversationId,
      messages: data.map((m): ChatMessage => ({
        id: m.id, role: m.role === 'user' ? 'user' : 'assistant', text: m.content, createdAt: m.created_at,
      })),
    };
  },

  async addChatMessage(conversationId, role, text) {
    const { data, error } = await supabase
      .from('chat_messages').insert({ conversation_id: conversationId, role, content: text })
      .select('id, role, content, created_at').single();
    fail(error);
    return { id: data.id, role, text: data.content, createdAt: data.created_at };
  },
};
