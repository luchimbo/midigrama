-- ============================================================
--  MIDIGrama - Esquema de base de datos (Supabase / Postgres)
-- ============================================================
-- Cómo usar:
--   1. Entrá a tu proyecto en https://supabase.com
--   2. Menú lateral -> SQL Editor -> New query
--   3. Pegá TODO este archivo y dale "Run".
-- ============================================================

-- Estado del día por usuario. Una fila por (usuario, día).
-- Si no existe fila para hoy, el día arranca vacío (template).
create table if not exists public.daily_state (
  user_id    text        not null,
  day        date        not null,
  tasks      jsonb       not null default '[]'::jsonb,
  novedades  jsonb       not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- Bitácora: reportes diarios emitidos. Lo del día queda acá para siempre.
create table if not exists public.reports (
  id           text        primary key,
  user_id      text        not null,
  user_name    text,
  area         text,
  day          date        not null,
  "timestamp"  text,
  timestamp_ms bigint,
  tasks        jsonb       not null default '[]'::jsonb,
  novedades    jsonb       not null default '[]'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists reports_day_idx on public.reports (day);
create index if not exists reports_user_idx on public.reports (user_id);

-- ------------------------------------------------------------
-- Row Level Security (RLS)
-- ------------------------------------------------------------
-- Es una herramienta interna sin login real (se usa PIN en el front).
-- Dejamos acceso abierto al rol anónimo (anon). Si más adelante querés
-- endurecerlo, se cambia acá.
alter table public.daily_state enable row level security;
alter table public.reports     enable row level security;

drop policy if exists daily_state_anon_all on public.daily_state;
create policy daily_state_anon_all on public.daily_state
  for all to anon using (true) with check (true);

drop policy if exists reports_anon_all on public.reports;
create policy reports_anon_all on public.reports
  for all to anon using (true) with check (true);
