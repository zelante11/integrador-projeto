// Modelos de domínio do GymUp. São a "fonte da verdade" para o app e para o banco
// (veja supabase/schema.sql, que espelha estes tipos).

export type GoalId = 'condicionamento' | 'bem-estar' | 'hipertrofia' | 'emagrecimento';

export const MEASURE_KEYS = [
  'Peito', 'Cintura', 'Abdômen', 'Quadril', 'Braço', 'Antebraço', 'Coxa', 'Panturrilha',
] as const;
export type MeasureKey = (typeof MEASURE_KEYS)[number];
export type Measures = Record<MeasureKey, number | null>;

export type Profile = {
  id: string;
  name: string;
  email: string | null;
  age: number | null;
  weight: number | null; // kg
  height: number | null; // m
  goalId: GoalId;
  remindersEnabled: boolean;
};

export type Goal = { id: GoalId; name: string; description: string; icon: string };

export type Exercise = { id: string; name: string; sets: number; reps: string };
export type Workout = { id: string; goalId: GoalId; name: string; focus: string; exercises: Exercise[] };

export type SetLog = { load: number; reps: number }; // load em kg
export type ExerciseLog = { exerciseId: string; exerciseName: string; sets: SetLog[] };
export type WorkoutLog = {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string; // ISO
  exercises: ExerciseLog[];
};

export type ChatMessage = { id: string; role: 'user' | 'coach'; text: string; createdAt: string };
