-- Adds the "Danh hiệu" (title) and anonymous-send fields to `public.kudos` for the kudos
-- composer rebuild (plan: 260819-0351-viet-kudo-composer, phase 02).
--
-- DO NOT run 'supabase db reset' on this project: the pre-existing `kudos` schema was
-- provisioned out-of-band and has no earlier migration file to rebuild it from. A reset would
-- irrecoverably destroy the live database. Apply this file with 'supabase db push' (or the
-- Supabase MCP `apply_migration` tool) only.
--
-- `title` is nullable at the database level even though the application validator requires it:
-- rows written before this migration have none, and `not null default ''` would encode a lie
-- about their state. Required-ness lives in `validateSendKudosInput`, not in this constraint.
--
-- SECURITY NOTE — anonymity is presentational only (clarifications.md, round 2): `sender_id`
-- stays stored on every row and stays readable by anyone with `select` on `kudos` via
-- PostgREST, anonymous or not. This migration does not attempt an RLS/view change to hide it.
-- Anyone reading or writing `is_anonymous` / `anonymous_name` elsewhere in the codebase must not
-- present that as real anonymity — it only controls what the UI chooses to render.

alter table public.kudos
  add column if not exists title text,
  add column if not exists is_anonymous boolean not null default false,
  add column if not exists anonymous_name text;

alter table public.kudos
  drop constraint if exists kudos_title_length;
alter table public.kudos
  add constraint kudos_title_length check (title is null or char_length(title) <= 120);

alter table public.kudos
  drop constraint if exists kudos_anonymous_name_length;
alter table public.kudos
  add constraint kudos_anonymous_name_length check (anonymous_name is null or char_length(anonymous_name) <= 60);

alter table public.kudos
  drop constraint if exists kudos_anonymous_name_present;
alter table public.kudos
  add constraint kudos_anonymous_name_present check (not is_anonymous or anonymous_name is not null);

comment on column public.kudos.title is
  'Danh hiệu — required by the app validator, nullable here because rows predating this migration have none.';
comment on column public.kudos.is_anonymous is
  'Presentational only: sender_id is still stored and still readable via PostgREST regardless of this flag. See migration header.';
comment on column public.kudos.anonymous_name is
  'Display name shown in place of the sender when is_anonymous is true. Rendered as plain text, never as HTML.';
