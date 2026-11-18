import { Repository } from './repository';
import { mockRepository } from './mock';

// Para usar o Supabase: copie supabase.ts.example para supabase.ts e troque a linha abaixo por
//   import { supabaseRepository } from './supabase';
//   export const db: Repository = supabaseRepository;
export const db: Repository = mockRepository;
