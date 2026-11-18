-- GymUp: esquema inicial para o Supabase (rode no SQL Editor, depois rode seed.sql).
-- Espelha os tipos de src/types.ts.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  age int check (age between 10 and 120),
  weight_kg numeric(5,1) check (weight_kg between 20 and 400),
  height_m numeric(3,2) check (height_m between 0.5 and 2.5),
  goal_id text not null default 'hipertrofia',
  reminders_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- Catálogo (igual para todos os usuários)
create table public.goals (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null
);
create table public.workouts (
  id text primary key,
  goal_id text not null references public.goals(id),
  name text not null,
  focus text not null,
  position int not null default 0
);
create table public.exercises (
  id text primary key,
  workout_id text not null references public.workouts(id) on delete cascade,
  name text not null,
  sets int not null,
  reps text not null,
  position int not null default 0
);

alter table public.profiles add constraint profiles_goal_fk foreign key (goal_id) references public.goals(id);

-- Medidas corporais: uma linha por usuário e região (Peito, Cintura, ...)
create table public.body_measurements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  site text not null,
  value_cm numeric(5,1) check (value_cm between 5 and 300),
  updated_at timestamptz not null default now(),
  primary key (user_id, site)
);

-- Treinos realizados
create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  workout_id text references public.workouts(id),
  workout_name text not null,
  performed_at timestamptz not null default now()
);
create table public.set_logs (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null references public.workout_logs(id) on delete cascade,
  exercise_id text references public.exercises(id),
  exercise_name text not null,
  set_number int not null,
  load_kg numeric(6,2) not null default 0,
  reps int not null default 0
);
create index on public.workout_logs (user_id, performed_at desc);
create index on public.set_logs (log_id);

-- Segurança: cada usuário só enxerga os próprios dados
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.body_measurements enable row level security;
alter table public.workout_logs enable row level security;
alter table public.set_logs enable row level security;

create policy "perfil: ler o próprio" on public.profiles for select using (id = auth.uid());
create policy "perfil: criar o próprio" on public.profiles for insert with check (id = auth.uid());
create policy "perfil: editar o próprio" on public.profiles for update using (id = auth.uid());

create policy "catálogo: leitura" on public.goals for select to authenticated using (true);
create policy "catálogo: leitura" on public.workouts for select to authenticated using (true);
create policy "catálogo: leitura" on public.exercises for select to authenticated using (true);

create policy "medidas: só do dono" on public.body_measurements for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "treinos: só do dono" on public.workout_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "séries: só do dono" on public.set_logs for all
  using (exists (select 1 from public.workout_logs l where l.id = log_id and l.user_id = auth.uid()))
  with check (exists (select 1 from public.workout_logs l where l.id = log_id and l.user_id = auth.uid()));

-- Cria o perfil automaticamente quando alguém se cadastra
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, age, weight_kg, height_m, goal_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Atleta'),
    new.email,
    nullif(new.raw_user_meta_data->>'age', '')::int,
    nullif(new.raw_user_meta_data->>'weight', '')::numeric,
    nullif(new.raw_user_meta_data->>'height', '')::numeric,
    coalesce(nullif(new.raw_user_meta_data->>'goal_id', ''), 'hipertrofia')
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();
