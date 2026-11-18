import raw from './catalog.json';
import { Goal, GoalId, Workout } from '../types';

// Catálogo padrão (metas e treinos). No Supabase ele vira as tabelas goals/workouts/exercises
// (supabase/seed.sql é gerado deste mesmo JSON, com os mesmos ids).
export const GOALS = raw.goals as Goal[];

export const WORKOUTS: Workout[] = raw.workouts.map((w) => ({
  id: w.id,
  goalId: w.goalId as GoalId,
  name: w.name,
  focus: w.focus,
  exercises: w.exercises.map((e, i) => ({ id: `${w.id}-${i + 1}`, name: e.name, sets: e.sets, reps: e.reps })),
}));
