import { ChatMessage, Goal, Measures, Profile, Workout, WorkoutLog } from '../../types';

// Contrato de acesso a dados. O app inteiro só conversa com esta interface (via `db`).
// Para trocar de banco, crie outra implementação (veja supabase.ts.example) e mude o export em ./index.ts.
export interface Repository {
  getProfile(): Promise<Profile>;
  updateProfile(patch: Partial<Omit<Profile, 'id'>>): Promise<Profile>;

  getMeasures(): Promise<Measures>;
  saveMeasures(measures: Measures): Promise<Measures>;

  listGoals(): Promise<Goal[]>;
  listWorkouts(): Promise<Workout[]>;

  listLogs(): Promise<WorkoutLog[]>; // mais recentes primeiro
  addLog(log: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog>;

  // Resposta do CoachPro. Hoje é simulada; depois pode chamar uma Edge Function / API de IA.
  coachReply(history: ChatMessage[], text: string): Promise<string>;
}
