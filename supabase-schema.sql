-- =============================================
--  BOLÃO COPA DO MUNDO 2026 — Supabase Schema
-- =============================================
-- Execute este SQL no Supabase SQL Editor

-- 1. PROFILES (usuários)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  nick text not null unique,
  display_name text not null,
  avatar_url text,
  points int default 0,
  exact_hits int default 0,
  partial_hits int default 0,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Perfis visíveis para todos os autenticados"
  on profiles for select to authenticated using (true);

create policy "Usuário edita o próprio perfil"
  on profiles for update to authenticated using (auth.uid() = id);

create policy "Usuário insere o próprio perfil"
  on profiles for insert to authenticated with check (auth.uid() = id);

-- 2. MATCHES (jogos)
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  home_team text not null,
  away_team text not null,
  home_flag text,
  away_flag text,
  home_score int,
  away_score int,
  match_date timestamptz not null,
  stage text default 'Grupos',  -- 'Grupos', 'R16', 'QF', 'SF', 'F', 'THIRD'
  group_name text,
  status text default 'upcoming', -- 'upcoming', 'live', 'finished'
  stream_url text,
  external_id text unique,
  created_at timestamptz default now()
);

alter table matches enable row level security;

create policy "Jogos visíveis para autenticados"
  on matches for select to authenticated using (true);

-- 3. GUESSES (palpites)
create table if not exists guesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  match_id uuid references matches(id) on delete cascade not null,
  home_score int not null,
  away_score int not null,
  points_earned int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, match_id)
);

alter table guesses enable row level security;

create policy "Usuário vê seus próprios palpites antes do jogo"
  on guesses for select to authenticated using (
    auth.uid() = user_id
    or exists (
      select 1 from matches m
      where m.id = match_id and m.status = 'finished'
    )
  );

create policy "Usuário insere próprios palpites"
  on guesses for insert to authenticated with check (auth.uid() = user_id);

create policy "Usuário edita próprios palpites"
  on guesses for update to authenticated using (auth.uid() = user_id);

-- 4. GROUP STANDINGS
create table if not exists group_standings (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  team_name text not null,
  flag_emoji text,
  shield_url text,
  played int default 0,
  won int default 0,
  drawn int default 0,
  lost int default 0,
  goals_for int default 0,
  goals_against int default 0,
  goal_diff int default 0,
  points int default 0,
  updated_at timestamptz default now()
);

alter table group_standings enable row level security;
create policy "Group standings visíveis para autenticados"
  on group_standings for select to authenticated using (true);

-- 5. TOP SCORERS
create table if not exists top_scorers (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  team_name text,
  flag_emoji text,
  photo_url text,
  goals int default 0,
  updated_at timestamptz default now()
);

alter table top_scorers enable row level security;
create policy "Top scorers visíveis para autenticados"
  on top_scorers for select to authenticated using (true);

-- 6. TOP ASSISTS
create table if not exists top_assists (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  team_name text,
  flag_emoji text,
  photo_url text,
  assists int default 0,
  updated_at timestamptz default now()
);

alter table top_assists enable row level security;
create policy "Top assists visíveis para autenticados"
  on top_assists for select to authenticated using (true);

-- =============================================
-- TRIGGER: Calcular pontos quando placar é inserido
-- Regra: 3pts acerto exato | 1pt acerto de vencedor/empate
-- =============================================

create or replace function calculate_guess_points()
returns trigger as $$
declare
  v_home int;
  v_away int;
  v_pts int;
  v_exact int;
  v_partial int;
begin
  -- pega o placar oficial
  select home_score, away_score into v_home, v_away
  from matches
  where id = new.match_id and status = 'finished';

  if v_home is null then
    return new;
  end if;

  -- calcula pontos
  if new.home_score = v_home and new.away_score = v_away then
    v_pts := 3;
    v_exact := 1;
    v_partial := 0;
  elsif
    (new.home_score > new.away_score and v_home > v_away) or
    (new.home_score < new.away_score and v_home < v_away) or
    (new.home_score = new.away_score and v_home = v_away)
  then
    v_pts := 1;
    v_exact := 0;
    v_partial := 1;
  else
    v_pts := 0;
    v_exact := 0;
    v_partial := 0;
  end if;

  new.points_earned := v_pts;

  -- atualiza o perfil do usuário
  update profiles
  set
    points = points - coalesce(old.points_earned, 0) + v_pts,
    exact_hits = exact_hits - (case when old.points_earned = 3 then 1 else 0 end) + v_exact,
    partial_hits = partial_hits - (case when old.points_earned = 1 then 1 else 0 end) + v_partial
  where id = new.user_id;

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_guess_upsert
  before insert or update on guesses
  for each row execute function calculate_guess_points();

-- TRIGGER: Recalcular todos os palpites quando placar é adicionado a um jogo
create or replace function recalculate_on_match_finish()
returns trigger as $$
begin
  if new.status = 'finished' and (old.status is distinct from 'finished' or old.home_score is distinct from new.home_score or old.away_score is distinct from new.away_score) then
    -- recalcula tocando em updated_at para disparar o trigger de guesses
    update guesses
    set updated_at = now()
    where match_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_match_score_update
  after update on matches
  for each row execute function recalculate_on_match_finish();

-- =============================================
-- Storage bucket para avatars
-- =============================================
-- Execute manualmente no Supabase Storage (ou via API):
-- Criar bucket público chamado "avatars"
