import * as Linking from 'expo-linking';
import { isEmail, toNum } from '../utils/format';
import { PlanSlug } from '../types';
import { supabase } from './supabase';

export type SignUpData = {
  name: string; email: string; password: string;
  age: string; weight: string; height: string; goal: PlanSlug | '';
};

// Traduz as mensagens de erro do Supabase Auth.
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada)';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Este e-mail já está cadastrado';
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Aguarde um pouco e tente de novo';
  if (m.includes('password should be at least')) return 'A senha precisa ter 6+ caracteres';
  if (m.includes('same password') || m.includes('different from the old')) return 'Escolha uma senha diferente da atual';
  if (m.includes('network') || m.includes('fetch')) return 'Sem conexão. Verifique sua internet';
  return message;
}

export async function login(email: string, password: string) {
  if (!isEmail(email) || password.length < 6) throw new Error('E-mail ou senha incorretos');
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(friendly(error.message));
}

// Devolve needsConfirmation=true quando o projeto exige confirmar o e-mail antes do primeiro login.
export async function signUp(d: SignUpData): Promise<{ needsConfirmation: boolean }> {
  if (!d.name.trim() || !isEmail(d.email) || d.password.length < 6)
    throw new Error('Preencha nome, e-mail e uma senha com 6+ caracteres');

  const age = toNum(d.age), weight = toNum(d.weight), height = toNum(d.height);
  if (age != null && (age < 10 || age > 120)) throw new Error('Idade inválida');
  if (weight != null && (weight < 20 || weight > 400)) throw new Error('Peso inválido (use kg)');
  if (height != null && (height < 0.5 || height > 2.5)) throw new Error('Altura inválida (use metros, ex: 1,70)');

  // O trigger handle_new_user cria o perfil a partir destes metadados.
  const { data, error } = await supabase.auth.signUp({
    email: d.email.trim(),
    password: d.password,
    options: {
      data: { name: d.name.trim(), age, weight, height, goal_slug: d.goal || null },
      emailRedirectTo: Linking.createURL('/'),
    },
  });
  if (error) throw new Error(friendly(error.message));
  // Se o e-mail já existe e a confirmação está ligada, o Supabase devolve um usuário sem identidades.
  if (data.user && data.user.identities?.length === 0) throw new Error('Este e-mail já está cadastrado');
  return { needsConfirmation: !data.session };
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function requestPasswordReset(email: string) {
  if (!isEmail(email)) throw new Error('E-mail incorreto');
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: Linking.createURL('/reset-password'),
  });
  if (error) throw new Error(friendly(error.message));
}

export async function updatePassword(password: string, confirm: string) {
  if (password.length < 6) throw new Error('A senha precisa ter 6+ caracteres');
  if (password !== confirm) throw new Error('Senhas diferentes');
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Link expirado. Peça uma nova recuperação de senha');
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(friendly(error.message));
}

// Links do e-mail (confirmação de cadastro e recuperação de senha) chegam ao app com os tokens no "#".
// Cria a sessão a partir do link e diz de que tipo ele era.
export async function handleAuthLink(url: string): Promise<'recovery' | 'signed-in' | null> {
  const hash = url.includes('#') ? url.split('#')[1] : '';
  if (!hash) return null;
  const p = new URLSearchParams(hash);
  const access_token = p.get('access_token');
  const refresh_token = p.get('refresh_token');
  if (!access_token || !refresh_token) return null;
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) return null;
  return p.get('type') === 'recovery' ? 'recovery' : 'signed-in';
}
