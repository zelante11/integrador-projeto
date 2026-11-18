// Gerado a partir do schema do projeto Supabase "gymup".
// Para atualizar após mudar o banco: npx supabase gen types typescript --project-id dufwgcsyhetckovsflig

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: '14.18' };
  public: {
    Tables: {
      body_measurements: {
        Row: {
          abdomen: number | null; arm: number | null; calf: number | null; chest: number | null;
          created_at: string; forearm: number | null; hip: number | null; id: number;
          measured_on: string; thigh: number | null; user_id: string; waist: number | null;
        };
        Insert: {
          abdomen?: number | null; arm?: number | null; calf?: number | null; chest?: number | null;
          created_at?: string; forearm?: number | null; hip?: number | null; id?: never;
          measured_on?: string; thigh?: number | null; user_id: string; waist?: number | null;
        };
        Update: {
          abdomen?: number | null; arm?: number | null; calf?: number | null; chest?: number | null;
          created_at?: string; forearm?: number | null; hip?: number | null; id?: never;
          measured_on?: string; thigh?: number | null; user_id?: string; waist?: number | null;
        };
        Relationships: [
          { foreignKeyName: 'body_measurements_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      chat_conversations: {
        Row: { created_at: string; id: string; title: string; updated_at: string; user_id: string };
        Insert: { created_at?: string; id?: string; title?: string; updated_at?: string; user_id: string };
        Update: { created_at?: string; id?: string; title?: string; updated_at?: string; user_id?: string };
        Relationships: [
          { foreignKeyName: 'chat_conversations_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      chat_messages: {
        Row: { content: string; conversation_id: string; created_at: string; id: string; role: string };
        Insert: { content: string; conversation_id: string; created_at?: string; id?: string; role: string };
        Update: { content?: string; conversation_id?: string; created_at?: string; id?: string; role?: string };
        Relationships: [
          { foreignKeyName: 'chat_messages_conversation_id_fkey'; columns: ['conversation_id']; isOneToOne: false; referencedRelation: 'chat_conversations'; referencedColumns: ['id'] },
        ];
      };
      exercise_notes: {
        Row: { content: string; exercise_id: string; updated_at: string; user_id: string };
        Insert: { content: string; exercise_id: string; updated_at?: string; user_id: string };
        Update: { content?: string; exercise_id?: string; updated_at?: string; user_id?: string };
        Relationships: [
          { foreignKeyName: 'exercise_notes_exercise_id_fkey'; columns: ['exercise_id']; isOneToOne: false; referencedRelation: 'exercises'; referencedColumns: ['id'] },
          { foreignKeyName: 'exercise_notes_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      exercises: {
        Row: { equipment: string | null; id: string; name: string; primary_muscle: string | null; video_path: string | null };
        Insert: { equipment?: string | null; id: string; name: string; primary_muscle?: string | null; video_path?: string | null };
        Update: { equipment?: string | null; id?: string; name?: string; primary_muscle?: string | null; video_path?: string | null };
        Relationships: [];
      };
      personal_records: {
        Row: { created_at: string; exercise_id: string; id: number; recorded_on: string; user_id: string; weight_kg: number };
        Insert: { created_at?: string; exercise_id: string; id?: never; recorded_on?: string; user_id: string; weight_kg: number };
        Update: { created_at?: string; exercise_id?: string; id?: never; recorded_on?: string; user_id?: string; weight_kg?: number };
        Relationships: [
          { foreignKeyName: 'personal_records_exercise_id_fkey'; columns: ['exercise_id']; isOneToOne: false; referencedRelation: 'exercises'; referencedColumns: ['id'] },
          { foreignKeyName: 'personal_records_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      plan_exercises: {
        Row: {
          day_label: string; difficulty: number | null; exercise_id: string; id: number; instructions: string[];
          notes: string | null; plan_slug: string; position: number; reps: string; rest_seconds: number;
          secondary_muscle: string | null; sets: number;
        };
        Insert: {
          day_label: string; difficulty?: number | null; exercise_id: string; id?: never; instructions?: string[];
          notes?: string | null; plan_slug: string; position?: number; reps: string; rest_seconds: number;
          secondary_muscle?: string | null; sets: number;
        };
        Update: {
          day_label?: string; difficulty?: number | null; exercise_id?: string; id?: never; instructions?: string[];
          notes?: string | null; plan_slug?: string; position?: number; reps?: string; rest_seconds?: number;
          secondary_muscle?: string | null; sets?: number;
        };
        Relationships: [
          { foreignKeyName: 'plan_exercises_exercise_id_fkey'; columns: ['exercise_id']; isOneToOne: false; referencedRelation: 'exercises'; referencedColumns: ['id'] },
          { foreignKeyName: 'plan_exercises_plan_slug_fkey'; columns: ['plan_slug']; isOneToOne: false; referencedRelation: 'plans'; referencedColumns: ['slug'] },
        ];
      };
      plan_faqs: {
        Row: { answer: string; id: number; plan_slug: string; position: number; question: string };
        Insert: { answer: string; id?: never; plan_slug: string; position?: number; question: string };
        Update: { answer?: string; id?: never; plan_slug?: string; position?: number; question?: string };
        Relationships: [
          { foreignKeyName: 'plan_faqs_plan_slug_fkey'; columns: ['plan_slug']; isOneToOne: false; referencedRelation: 'plans'; referencedColumns: ['slug'] },
        ];
      };
      plan_sources: {
        Row: { id: number; label: string; plan_slug: string; position: number; url: string };
        Insert: { id?: never; label: string; plan_slug: string; position?: number; url: string };
        Update: { id?: never; label?: string; plan_slug?: string; position?: number; url?: string };
        Relationships: [
          { foreignKeyName: 'plan_sources_plan_slug_fkey'; columns: ['plan_slug']; isOneToOne: false; referencedRelation: 'plans'; referencedColumns: ['slug'] },
        ];
      };
      plans: {
        Row: {
          badges: string[]; description: string; frequency: string; hero_image_path: string | null; label: string;
          nutrition_food: string | null; nutrition_supplement: string | null; objective: string; position: number;
          recovery: string[]; slug: string; title: string; warmup: string[];
        };
        Insert: {
          badges?: string[]; description: string; frequency: string; hero_image_path?: string | null; label: string;
          nutrition_food?: string | null; nutrition_supplement?: string | null; objective: string; position?: number;
          recovery?: string[]; slug: string; title: string; warmup?: string[];
        };
        Update: {
          badges?: string[]; description?: string; frequency?: string; hero_image_path?: string | null; label?: string;
          nutrition_food?: string | null; nutrition_supplement?: string | null; objective?: string; position?: number;
          recovery?: string[]; slug?: string; title?: string; warmup?: string[];
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          age: number | null; body_fat_pct: number | null; created_at: string; desired_frequency: number;
          email: string | null; experience_level: string | null; height_m: number | null; id: string; name: string;
          onboarding_completed: boolean; recommended_plan_slug: string | null; selected_plan_slug: string | null;
          training_goal_slug: string | null; updated_at: string; weight_kg: number | null;
        };
        Insert: {
          age?: number | null; body_fat_pct?: number | null; created_at?: string; desired_frequency?: number;
          email?: string | null; experience_level?: string | null; height_m?: number | null; id: string; name: string;
          onboarding_completed?: boolean; recommended_plan_slug?: string | null; selected_plan_slug?: string | null;
          training_goal_slug?: string | null; updated_at?: string; weight_kg?: number | null;
        };
        Update: {
          age?: number | null; body_fat_pct?: number | null; created_at?: string; desired_frequency?: number;
          email?: string | null; experience_level?: string | null; height_m?: number | null; id?: string; name?: string;
          onboarding_completed?: boolean; recommended_plan_slug?: string | null; selected_plan_slug?: string | null;
          training_goal_slug?: string | null; updated_at?: string; weight_kg?: number | null;
        };
        Relationships: [
          { foreignKeyName: 'profiles_recommended_plan_slug_fkey'; columns: ['recommended_plan_slug']; isOneToOne: false; referencedRelation: 'plans'; referencedColumns: ['slug'] },
          { foreignKeyName: 'profiles_selected_plan_slug_fkey'; columns: ['selected_plan_slug']; isOneToOne: false; referencedRelation: 'plans'; referencedColumns: ['slug'] },
          { foreignKeyName: 'profiles_training_goal_slug_fkey'; columns: ['training_goal_slug']; isOneToOne: false; referencedRelation: 'plans'; referencedColumns: ['slug'] },
        ];
      };
      set_logs: {
        Row: { exercise_id: string | null; exercise_name: string; id: string; load_kg: number; log_id: string; reps: number; set_number: number };
        Insert: { exercise_id?: string | null; exercise_name: string; id?: string; load_kg?: number; log_id: string; reps?: number; set_number: number };
        Update: { exercise_id?: string | null; exercise_name?: string; id?: string; load_kg?: number; log_id?: string; reps?: number; set_number?: number };
        Relationships: [
          { foreignKeyName: 'set_logs_exercise_id_fkey'; columns: ['exercise_id']; isOneToOne: false; referencedRelation: 'exercises'; referencedColumns: ['id'] },
          { foreignKeyName: 'set_logs_log_id_fkey'; columns: ['log_id']; isOneToOne: false; referencedRelation: 'workout_logs'; referencedColumns: ['id'] },
        ];
      };
      user_plan_exercises: {
        Row: { plan_exercise_id: number; position: number; removed: boolean; user_id: string };
        Insert: { plan_exercise_id: number; position: number; removed?: boolean; user_id: string };
        Update: { plan_exercise_id?: number; position?: number; removed?: boolean; user_id?: string };
        Relationships: [
          { foreignKeyName: 'user_plan_exercises_plan_exercise_id_fkey'; columns: ['plan_exercise_id']; isOneToOne: false; referencedRelation: 'plan_exercises'; referencedColumns: ['id'] },
          { foreignKeyName: 'user_plan_exercises_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      user_settings: {
        Row: { assistant_visible: boolean; compact_cards: boolean; default_unit: string; language: string; reminders: boolean; updated_at: string; user_id: string; weekly_summary: boolean };
        Insert: { assistant_visible?: boolean; compact_cards?: boolean; default_unit?: string; language?: string; reminders?: boolean; updated_at?: string; user_id: string; weekly_summary?: boolean };
        Update: { assistant_visible?: boolean; compact_cards?: boolean; default_unit?: string; language?: string; reminders?: boolean; updated_at?: string; user_id?: string; weekly_summary?: boolean };
        Relationships: [
          { foreignKeyName: 'user_settings_user_id_fkey'; columns: ['user_id']; isOneToOne: true; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      workout_logs: {
        Row: { day_label: string | null; id: string; performed_at: string; plan_slug: string | null; user_id: string; workout_name: string };
        Insert: { day_label?: string | null; id?: string; performed_at?: string; plan_slug?: string | null; user_id: string; workout_name: string };
        Update: { day_label?: string | null; id?: string; performed_at?: string; plan_slug?: string | null; user_id?: string; workout_name?: string };
        Relationships: [
          { foreignKeyName: 'workout_logs_plan_slug_fkey'; columns: ['plan_slug']; isOneToOne: false; referencedRelation: 'plans'; referencedColumns: ['slug'] },
          { foreignKeyName: 'workout_logs_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      complete_onboarding: { Args: { p_freq: number; p_goal: string; p_level: string }; Returns: string };
      recommend_plan: { Args: { p_freq: number; p_goal: string; p_level: string }; Returns: string };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
