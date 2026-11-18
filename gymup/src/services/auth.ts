// Camada de autenticação MOCKADA.
// Para conectar ao Supabase, troque o corpo destas funções mantendo as assinaturas:
//   import { supabase } from './supabase';
//   login:   supabase.auth.signInWithPassword({ email, password })
//   signUp:  supabase.auth.signUp({ email, password, options: { data: { name, age, weight, height, goal } } })
//   request: supabase.auth.resetPasswordForEmail(email)
//   update:  supabase.auth.updateUser({ password })

import { GOALS } from '../data/catalog';
import { db } from './db';
import { toNum } from '../utils/format';

const wait = (ms = 900) => new Promise((r) => setTimeout(r, ms));
const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());

export type SignUpData = {
  name: string; email: string; password: string;
  age: string; weight: string; height: string; goal: string;
};

export async function login(email: string, password: string) {
  await wait();
  if (!isEmail(email) || password.length < 6) throw new Error('E-mail ou senha incorretos');
  const profile = await db.updateProfile({ email: email.trim() });
  return { user: { name: profile.name, email: profile.email } };
}

export async function signUp(data: SignUpData) {
  await wait();
  if (!data.name || !isEmail(data.email) || data.password.length < 6)
    throw new Error('Preencha nome, e-mail e uma senha com 6+ caracteres');
  // Com Supabase: o trigger handle_new_user cria o perfil; aqui só complementamos os dados.
  const goalId = GOALS.find((g) => g.name === data.goal)?.id;
  const profile = await db.updateProfile({
    name: data.name.trim(),
    email: data.email.trim(),
    age: toNum(data.age),
    weight: toNum(data.weight),
    height: toNum(data.height),
    ...(goalId ? { goalId } : {}),
  });
  return { user: { name: profile.name, email: profile.email } };
}

export async function requestPasswordReset(email: string) {
  await wait();
  if (!isEmail(email)) throw new Error('E-mail incorreto');
}

export async function updatePassword(password: string, confirm: string) {
  await wait();
  if (password.length < 6) throw new Error('A senha precisa ter 6+ caracteres');
  if (password !== confirm) throw new Error('Senhas diferentes');
}
