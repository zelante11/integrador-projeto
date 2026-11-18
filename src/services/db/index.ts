import { Repository } from './repository';
import { supabaseRepository } from './supabase';

export const db: Repository = supabaseRepository;
