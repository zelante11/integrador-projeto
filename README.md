# GymUp

App de treino em **React Native + Expo + TypeScript**, com banco no **Supabase**.
Design do `gymup-app`; funcionalidades do `GymUp-main`.

## Rodar

```bash
npm install
npx expo start -c
```

Abra no celular com o app **Expo Go** (leia o QR code) ou use `a` (Android) / `i` (iOS) no terminal.
O arquivo `.env` já vem com a URL e a chave **pública** do projeto Supabase `gymup`.
Nunca coloque a chave `service_role` no app.

## Configurar o Supabase (uma vez)

No painel do projeto, em **Authentication**:

1. **Sign In / Providers > Email**: para testar sem e-mail de confirmação, desligue "Confirm email".
   Com ela ligada, o app mostra a tela "Confirme seu e-mail" depois do cadastro.
2. **URL Configuration > Redirect URLs**: adicione `gymup://**` e `exp://**`
   (necessário para os links de "esqueci minha senha" e de confirmação abrirem o app).

## O que o app tem

- Cadastro, login, recuperação de senha (Supabase Auth)
- Onboarding: objetivo, nível e frequência -> plano recomendado (função `complete_onboarding` do banco)
- 5 planos com capa, treinos por dia, aquecimento, pós-treino, alimentação, FAQ e fontes
- Exercícios com vídeo, instruções, dificuldade, recorde pessoal e anotações
- Personalizar o plano: reordenar e remover exercícios
- Registrar treino série a série; recordes pessoais detectados automaticamente
- Histórico de treinos e gráfico de cargas
- Perfil: dados pessoais, gordura corporal, medidas corporais com histórico e variação
- CoachPro (conversa salva no banco; respostas ainda por regras simples)
- Configurações: nome, lembretes, resumo semanal, atalho do CoachPro

## Estrutura

```
app/                 telas (expo-router)
  (tabs)/            Início, Planos, Perfil
  plano/[slug].tsx   detalhe do plano
  exercicio/[id].tsx detalhe do exercício
  treino.tsx         registro do treino
src/
  services/
    supabase.ts      cliente do Supabase
    auth.ts          login, cadastro, recuperação de senha
    db/              Repository (interface) + implementação Supabase
    database.types.ts tipos gerados do banco
  state/             AuthProvider e DataProvider
  components/        componentes de UI (mesmo design do gymup-app)
  utils/             formatação, estatísticas, ordem do plano
```

Todo acesso a dados passa pela interface `Repository` (`src/services/db/repository.ts`).

## Mídia

As imagens dos planos e os vídeos dos exercícios ficam no bucket público `media` do Storage
(`plans/`, `exercises/`, `body-parts/`, `logo/`). O banco guarda só o caminho relativo.

## Próximos passos sugeridos

- CoachPro com IA de verdade (Edge Function do Supabase)
- Notificações push para os lembretes
- Gerar o app instalável com EAS Build (`npx eas build`)
