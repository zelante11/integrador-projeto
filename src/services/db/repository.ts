import {
  ChatMessage, ExperienceLevel, Measures, MeasureEntry, NewWorkoutLog, OrderOverride, PersonalRecord,
  PlanDetail, PlanExercise, PlanSlug, PlanSummary, Profile, Settings, WorkoutLog,
} from '../../types';

export type ProfilePatch = Partial<
  Pick<Profile, 'name' | 'age' | 'weight' | 'height' | 'bodyFat' | 'trainingGoal' | 'experienceLevel' | 'desiredFrequency' | 'selectedPlan'>
>;

// Contrato de acesso a dados. O app inteiro só conversa com esta interface (via `db`).
// A implementação real está em ./supabase.ts.
export interface Repository {
  getProfile(): Promise<Profile>;
  updateProfile(patch: ProfilePatch): Promise<Profile>;
  completeOnboarding(input: { goal: PlanSlug; level: ExperienceLevel; frequency: number }): Promise<PlanSlug>;

  getSettings(): Promise<Settings>;
  updateSettings(patch: Partial<Settings>): Promise<Settings>;

  listPlans(): Promise<PlanSummary[]>;
  getPlan(slug: PlanSlug): Promise<PlanDetail>;
  getPlanExercise(id: number): Promise<PlanExercise>;

  getPlanOrder(slug: PlanSlug): Promise<OrderOverride[]>;
  savePlanOrder(overrides: OrderOverride[]): Promise<void>;
  resetPlanOrder(slug: PlanSlug): Promise<void>;

  listRecords(): Promise<PersonalRecord[]>; // mais recentes primeiro
  addRecord(exerciseId: string, weightKg: number): Promise<void>;
  getNote(exerciseId: string): Promise<string>;
  saveNote(exerciseId: string, content: string): Promise<void>;

  listMeasures(): Promise<MeasureEntry[]>; // mais recentes primeiro
  addMeasures(values: Measures): Promise<MeasureEntry>;

  listLogs(): Promise<WorkoutLog[]>; // mais recentes primeiro
  addLog(log: NewWorkoutLog): Promise<WorkoutLog>;

  getChat(): Promise<{ conversationId: string; messages: ChatMessage[] }>;
  addChatMessage(conversationId: string, role: ChatMessage['role'], text: string): Promise<ChatMessage>;
}
