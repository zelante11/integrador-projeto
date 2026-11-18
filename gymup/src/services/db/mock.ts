import { GOALS, WORKOUTS } from '../../data/catalog';
import { MEASURE_KEYS, Measures, Profile, WorkoutLog } from '../../types';
import { Repository } from './repository';

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

const emptyMeasures = (): Measures =>
  Object.fromEntries(MEASURE_KEYS.map((k) => [k, null])) as Measures;

// Estado em memória: some quando o app é fechado.
let profile: Profile = {
  id: 'local-user', name: 'Amandha', email: null, age: null, weight: null, height: null,
  goalId: 'hipertrofia', remindersEnabled: true,
};
let measures: Measures = emptyMeasures();
let logs: WorkoutLog[] = [];

export const mockRepository: Repository = {
  async getProfile() { await wait(); return { ...profile }; },
  async updateProfile(patch) { await wait(); profile = { ...profile, ...patch }; return { ...profile }; },

  async getMeasures() { await wait(); return { ...measures }; },
  async saveMeasures(m) { await wait(); measures = { ...m }; return { ...measures }; },

  async listGoals() { return GOALS; },
  async listWorkouts() { return WORKOUTS; },

  async listLogs() { await wait(); return [...logs]; },
  async addLog(log) {
    await wait();
    const saved: WorkoutLog = { ...log, id: `log-${Date.now()}` };
    logs = [saved, ...logs];
    return saved;
  },

  async coachReply(_history, text) {
    await wait(800);
    const t = text.toLowerCase();
    if (/(dor|lesão|lesao|machuc)/.test(t))
      return 'Se sentir dor, pare o exercício. Dor aguda ou que não passa merece avaliação de um profissional de saúde antes de continuar o treino.';
    if (/(carga|peso|aumentar)/.test(t))
      return 'Uma boa regra: quando você completar todas as séries no topo da faixa de repetições com boa técnica, suba a carga em pequenos passos, de 2% a 5%.';
    if (/(descanso|descansar|intervalo|pausa)/.test(t))
      return 'Em exercícios de força, descansar de 60 a 120 segundos entre as séries costuma funcionar bem. Em exercícios mais pesados, vale ir até 3 minutos.';
    if (/(proteína|proteina|dieta|alimenta|comer)/.test(t))
      return 'Para orientação alimentar personalizada, o ideal é um nutricionista. Posso ajudar com dúvidas gerais de treino enquanto isso.';
    if (/(frequência|frequencia|quantas vezes|quantos dias)/.test(t))
      return 'Seguir o plano com 3 a 4 treinos por semana, com pelo menos um dia de descanso entre grupos musculares iguais, é um bom ponto de partida.';
    return 'Entendi! Posso ajudar com cargas, descanso, frequência e técnica dos exercícios do seu plano. Me conte um pouco mais sobre a sua dúvida.';
  },
};
