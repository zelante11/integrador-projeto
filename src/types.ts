// Modelos de domínio do GymUp. O banco (Supabase) usa snake_case; a conversão fica em services/db/supabase.ts.

export type PlanSlug = 'iniciantes' | 'hipertrofia' | 'emagrecimento' | 'performance' | 'bem-estar';
export type ExperienceLevel = 'iniciante' | 'intermediario' | 'avancado';

export const MEASURE_KEYS = [
  'Peito', 'Cintura', 'Abdômen', 'Quadril', 'Braço', 'Antebraço', 'Coxa', 'Panturrilha',
] as const;
export type MeasureKey = (typeof MEASURE_KEYS)[number];
export type Measures = Record<MeasureKey, number | null>;
export type MeasureEntry = { id: number; measuredOn: string; values: Measures };

export type Profile = {
  id: string;
  name: string;
  email: string | null;
  age: number | null;
  weight: number | null; // kg
  height: number | null; // m
  bodyFat: number | null; // %
  trainingGoal: PlanSlug | null;
  experienceLevel: ExperienceLevel | null;
  desiredFrequency: number;
  recommendedPlan: PlanSlug | null;
  selectedPlan: PlanSlug | null;
  onboardingCompleted: boolean;
};

export type Settings = { reminders: boolean; weeklySummary: boolean; assistantVisible: boolean };

export type PlanSummary = {
  slug: PlanSlug;
  label: string;
  title: string;
  description: string;
  frequency: string;
  objective: string;
  heroImageUrl: string | null;
  badges: string[];
};

export type Exercise = {
  id: string;
  name: string;
  equipment: string | null;
  primaryMuscle: string | null;
  videoUrl: string | null;
};

export type PlanExercise = {
  id: number;
  planSlug: PlanSlug;
  exercise: Exercise;
  dayLabel: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string | null;
  secondaryMuscle: string | null;
  difficulty: number | null;
  instructions: string[];
  position: number;
};

export type PlanDetail = PlanSummary & {
  warmup: string[];
  recovery: string[];
  nutritionFood: string | null;
  nutritionSupplement: string | null;
  faqs: { question: string; answer: string }[];
  sources: { label: string; url: string }[];
  exercises: PlanExercise[];
};

// Personalização do usuário sobre a ordem dos exercícios de um plano
export type OrderOverride = { planExerciseId: number; position: number; removed: boolean };

export type PersonalRecord = {
  id: number;
  exerciseId: string;
  exerciseName: string;
  weightKg: number;
  recordedOn: string;
};

export type SetLog = { load: number; reps: number }; // load em kg
export type ExerciseLog = { exerciseId: string; exerciseName: string; sets: SetLog[] };
export type WorkoutLog = {
  id: string;
  planSlug: PlanSlug | null;
  dayLabel: string | null;
  workoutName: string;
  date: string; // ISO
  exercises: ExerciseLog[];
};
export type NewWorkoutLog = Omit<WorkoutLog, 'id'>;

export type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string; createdAt: string };
