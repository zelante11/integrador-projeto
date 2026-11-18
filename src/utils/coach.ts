// Respostas do CoachPro. Hoje são simuladas por regras simples.
// Para usar IA de verdade, troque o corpo desta função por uma chamada a uma Edge Function do Supabase.
export async function coachReply(text: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 700));
  const t = text.toLowerCase();
  if (/(dor|lesão|lesao|machuc)/.test(t))
    return 'Se sentir dor, pare o exercício. Dor aguda ou que não passa merece avaliação de um profissional de saúde antes de continuar o treino.';
  if (/(carga|peso|aumentar)/.test(t))
    return 'Uma boa regra: quando você completar todas as séries no topo da faixa de repetições com boa técnica, suba a carga em pequenos passos, de 2% a 5%.';
  if (/(descanso|descansar|intervalo|pausa)/.test(t))
    return 'Em exercícios de força, descansar de 60 a 120 segundos entre as séries costuma funcionar bem. Em exercícios mais pesados, vale ir até 3 minutos.';
  if (/(proteína|proteina|dieta|alimenta|comer|suplemento|creatina|whey)/.test(t))
    return 'Para orientação alimentar personalizada, o ideal é um nutricionista. Na aba do seu plano há uma seção de alimentação com fontes confiáveis.';
  if (/(frequência|frequencia|quantas vezes|quantos dias)/.test(t))
    return 'Seguir o plano com 3 a 4 treinos por semana, com pelo menos um dia de descanso entre grupos musculares iguais, é um bom ponto de partida.';
  return 'Entendi! Posso ajudar com cargas, descanso, frequência e técnica dos exercícios do seu plano. Me conte um pouco mais sobre a sua dúvida.';
}

export const COACH_GREETING =
  'Oi! Sou o CoachPro. Posso ajudar com dúvidas sobre cargas, descanso e frequência dos seus treinos. Como posso ajudar?';
