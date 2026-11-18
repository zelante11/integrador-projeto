# GymUp (Expo + Expo Router)

## Como rodar
1. Crie o projeto base e entre nele:
   npx create-expo-app@latest gymup-app
   cd gymup-app
2. Apague as pastas `app/` e `src/` do projeto e copie para DENTRO dele as pastas `app/` e `src/` deste pacote
   (a pasta `supabase/` e o `.env.example` são opcionais por enquanto).
3. Instale as dependências:
   npx expo install @expo-google-fonts/barlow-condensed @expo-google-fonts/manrope expo-font react-native-svg react-native-safe-area-context expo-status-bar @expo/vector-icons
4. Rode: npx expo start -c

Login de teste (mock): qualquer e-mail válido + senha com 6 ou mais caracteres.

## Telas
Login, esqueci/nova senha, cadastro, home, metas, plano, treino (registro de cargas), histórico,
perfil (edição de dados e medidas), configurações e CoachPro (chat).

## Arquitetura de dados (pronta para um banco)
- `src/types.ts`            modelos do domínio.
- `src/data/catalog.json`   metas e treinos padrão (fonte única; gera `supabase/seed.sql`).
- `src/services/db/`        `repository.ts` (contrato), `mock.ts` (memória), `index.ts` (qual usar).
- `src/services/auth.ts`    autenticação mockada (troque pelo Supabase Auth).
- `src/state/DataProvider`  carrega tudo via `db` e expõe `useData()` às telas.
As telas NUNCA falam com o banco direto: só com `useData()` / `db`. Trocar de banco = trocar uma linha.
Hoje os dados ficam em memória e somem ao fechar o app.

## Conectando o Supabase (quando quiser)
1. Crie um projeto em supabase.com. No SQL Editor rode `supabase/schema.sql` e depois `supabase/seed.sql`.
2. Copie `.env.example` para `.env` e preencha URL e chave anon.
3. npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
4. Renomeie `src/services/db/supabase.ts.example` para `supabase.ts` e, em `src/services/db/index.ts`,
   exporte `supabaseRepository` no lugar do mock.
5. Em `src/services/auth.ts`, troque as funções pelas do `supabase.auth` (comentários no topo do arquivo).
6. CoachPro: crie uma Edge Function `coach` que chame o modelo de IA. A chave da IA fica só no servidor.
   Em `app/login.tsx`, `app/register.tsx` e `app/configuracoes.tsx` nada muda.

## Pendências
- Logo: `src/components/Logo.tsx` é um texto provisório.
- Metas, plano, treino, histórico, configurações e CoachPro não existiam no protótipo: foram criados no mesmo estilo visual.
- Registrar medidas guarda só o valor atual (sem histórico de medidas ao longo do tempo).
