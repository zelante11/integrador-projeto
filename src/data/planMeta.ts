import { Ionicons } from '@expo/vector-icons';
import { ExperienceLevel, PlanSlug } from '../types';

export type IconName = keyof typeof Ionicons.glyphMap;

// Ícone de cada plano (o catálogo em si vem do Supabase).
export const PLAN_ICONS: Record<PlanSlug, IconName> = {
  iniciantes: 'leaf-outline',
  hipertrofia: 'barbell-outline',
  emagrecimento: 'flame-outline',
  performance: 'speedometer-outline',
  'bem-estar': 'heart-outline',
};

export const planIcon = (slug: string | null | undefined): IconName =>
  (slug && PLAN_ICONS[slug as PlanSlug]) || 'barbell-outline';

// Objetivos mostrados no cadastro e no onboarding. O slug é o mesmo de plans.slug.
export const GOAL_OPTIONS: { slug: PlanSlug; label: string }[] = [
  { slug: 'iniciantes', label: 'Começar a treinar' },
  { slug: 'hipertrofia', label: 'Hipertrofia' },
  { slug: 'emagrecimento', label: 'Emagrecimento' },
  { slug: 'performance', label: 'Performance' },
  { slug: 'bem-estar', label: 'Bem-estar' },
];

export const LEVEL_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
];

export const FREQUENCY_OPTIONS = [2, 3, 4, 5, 6];
