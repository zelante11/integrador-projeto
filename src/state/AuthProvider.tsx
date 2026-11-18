import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '../services/supabase';
import { handleAuthLink } from '../services/auth';

type AuthCtx = {
  session: Session | null;
  ready: boolean;          // já leu a sessão salva no aparelho
  recovery: boolean;       // abriu o link de recuperação de senha
  clearRecovery: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return c;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Links do e-mail (confirmar cadastro / recuperar senha) abrem o app com os tokens na URL.
  useEffect(() => {
    let active = true;
    const open = async (url: string | null) => {
      if (!url) return;
      const kind = await handleAuthLink(url);
      if (active && kind === 'recovery') setRecovery(true);
    };
    Linking.getInitialURL().then(open);
    const sub = Linking.addEventListener('url', ({ url }) => open(url));
    return () => { active = false; sub.remove(); };
  }, []);

  const clearRecovery = useCallback(() => setRecovery(false), []);

  return <Ctx.Provider value={{ session, ready, recovery, clearRecovery }}>{children}</Ctx.Provider>;
}
