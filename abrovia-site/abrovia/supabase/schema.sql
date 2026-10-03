-- =====================================================================
-- ABROVIA — Supabase schema. Run once in: Supabase Dashboard > SQL Editor.
-- Safe to re-run.
-- =====================================================================
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  accent text not null default '#0ea5e9',
  role text check (role in ('abrovian','senior')),
  country text, university text, course text, study_year text, grad_year int,
  topics text[] not null default '{}',
  bio text,
  onboarded boolean not null default false,
  verification text not null default 'none' check (verification in ('none','pending','needs_info','verified','rejected')),
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[A-Za-z0-9_]{3,18}$'),
  constraint accent_format check (accent ~ '^#[0-9a-fA-F]{6}$')
);
create unique index if not exists profiles_username_lower on public.profiles (lower(username));

create table if not exists public.onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.senior_applications (
  user_id uuid primary key references auth.users(id) on delete cascade,
  linkedin text not null, uni_email text not null, proof_path text, instagram text,
  bio text not null, motivation text not null,
  status text not null default 'pending' check (status in ('pending','needs_info','verified','rejected')),
  reviewer_note text, submitted_at timestamptz not null default now(),
  reviewed_at timestamptz, reviewed_by uuid
);
create table if not exists public.stamps (
  user_id uuid references public.profiles(id) on delete cascade,
  key text not null check (char_length(key) <= 40),
  created_at timestamptz not null default now(),
  primary key (user_id, key)
);
create table if not exists public.feature_interest (
  user_id uuid references public.profiles(id) on delete cascade,
  feature_key text not null check (char_length(feature_key) <= 40),
  kind text not null check (kind in ('notify','vote')),
  created_at timestamptz not null default now(),
  primary key (user_id, feature_key, kind)
);
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 10 and 500),
  created_at timestamptz not null default now()
);
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  asker_id uuid not null references public.profiles(id) on delete cascade,
  to_senior uuid references public.profiles(id) on delete set null,
  topic text not null check (char_length(topic) <= 40),
  body text not null check (char_length(body) between 15 and 600),
  created_at timestamptz not null default now()
);
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  senior_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 20 and 2000),
  created_at timestamptz not null default now()
);
create table if not exists public.thanks (
  answer_id uuid references public.answers(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (answer_id, user_id)
);
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  body text not null,
  country text,
  status text not null default 'draft' check (status in ('draft','pending','published','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint story_len check (status = 'draft' or char_length(body) between 120 and 8000)
);
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 15 and 600),
  tag text not null default 'Post' check (char_length(tag) <= 20),
  country text,
  created_at timestamptz not null default now()
);
create table if not exists public.post_reactions (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  kind text check (kind in ('love','helpful')),
  primary key (post_id, user_id, kind)
);
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 80),
  price_text text not null check (char_length(price_text) between 1 and 30),
  city text not null check (char_length(city) between 2 and 60),
  contact text not null check (char_length(contact) between 5 and 120),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 8 and 120),
  kind text not null default 'Webinar' check (char_length(kind) <= 20),
  host_id uuid references public.profiles(id) on delete set null,
  host_name text not null,
  starts_at timestamptz not null,
  link text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create table if not exists public.event_rsvps (
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (event_id, user_id)
);

-- helper functions
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select is_admin from public.profiles where id = auth.uid()), false) $$;
create or replace function public.is_verified_senior() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'senior' and verification = 'verified') $$;
create or replace function public.can_contribute() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.profiles where id = auth.uid() and (role = 'abrovian' or verification = 'verified')) $$;
create or replace function public.username_available(u text) returns boolean
language sql stable security definer set search_path = public as
$$ select not exists (select 1 from public.profiles where lower(username) = lower(u)) $$;
grant execute on function public.username_available(text) to anon, authenticated;

-- new auth user -> profile row
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, accent)
  values (new.id, new.raw_user_meta_data->>'username', coalesce(new.raw_user_meta_data->>'accent', '#0ea5e9'));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- users can never change admin/verification/username, or switch role once set
create or replace function public.protect_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(current_setting('app.bypass', true), '') <> '1' and not public.is_admin() then
    new.is_admin := old.is_admin;
    new.verification := old.verification;
    new.username := old.username;
    if old.role is not null then new.role := old.role; end if;
  end if;
  return new;
end $$;
drop trigger if exists protect_profile on public.profiles;
create trigger protect_profile before update on public.profiles
for each row execute function public.protect_profile();

-- senior verification (only way to become pending / verified)
create or replace function public.submit_senior_application(
  p_linkedin text, p_email text, p_proof text, p_instagram text, p_bio text, p_motivation text
) returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Not signed in'; end if;
  if not exists (select 1 from profiles where id = uid and role = 'senior' and verification <> 'verified') then
    raise exception 'Only unverified Seniors can apply';
  end if;
  if p_linkedin !~* '^https?://([a-z]{2,3}\.)?linkedin\.com/in/[A-Za-z0-9_%-]+/?$' then raise exception 'Invalid LinkedIn URL'; end if;
  if p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Invalid email'; end if;
  if char_length(coalesce(p_bio,'')) < 40 or char_length(coalesce(p_motivation,'')) < 20 then raise exception 'Bio or motivation too short'; end if;
  insert into senior_applications (user_id, linkedin, uni_email, proof_path, instagram, bio, motivation)
  values (uid, p_linkedin, p_email, p_proof, nullif(p_instagram,''), p_bio, p_motivation)
  on conflict (user_id) do update set linkedin = excluded.linkedin, uni_email = excluded.uni_email,
    proof_path = coalesce(excluded.proof_path, senior_applications.proof_path), instagram = excluded.instagram,
    bio = excluded.bio, motivation = excluded.motivation, status = 'pending',
    reviewer_note = null, submitted_at = now(), reviewed_at = null;
  perform set_config('app.bypass', '1', true);
  update profiles set verification = 'pending', bio = p_bio where id = uid;
end $$;
grant execute on function public.submit_senior_application(text,text,text,text,text,text) to authenticated;

create or replace function public.review_application(p_user uuid, p_decision text, p_note text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admin only'; end if;
  if p_decision not in ('verified','needs_info','rejected') then raise exception 'Bad decision'; end if;
  perform set_config('app.bypass', '1', true);
  update senior_applications set status = p_decision, reviewer_note = p_note, reviewed_at = now(), reviewed_by = auth.uid() where user_id = p_user;
  update profiles set verification = p_decision where id = p_user;
end $$;
grant execute on function public.review_application(uuid,text,text) to authenticated;

-- row level security
alter table public.profiles enable row level security;
alter table public.onboarding enable row level security;
alter table public.senior_applications enable row level security;
alter table public.stamps enable row level security;
alter table public.feature_interest enable row level security;
alter table public.ideas enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.thanks enable row level security;
alter table public.stories enable row level security;
alter table public.posts enable row level security;
alter table public.post_reactions enable row level security;
alter table public.listings enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated using (true);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "onboarding own" on public.onboarding;
create policy "onboarding own" on public.onboarding for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "stamps own" on public.stamps;
create policy "stamps own" on public.stamps for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "interest own" on public.feature_interest;
create policy "interest own" on public.feature_interest for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "ideas insert" on public.ideas;
create policy "ideas insert" on public.ideas for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "ideas read" on public.ideas;
create policy "ideas read" on public.ideas for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "applications read" on public.senior_applications;
create policy "applications read" on public.senior_applications for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "questions read" on public.questions;
create policy "questions read" on public.questions for select to authenticated using (true);
drop policy if exists "questions insert" on public.questions;
create policy "questions insert" on public.questions for insert to authenticated with check (asker_id = auth.uid());
drop policy if exists "questions delete" on public.questions;
create policy "questions delete" on public.questions for delete to authenticated using (asker_id = auth.uid() or public.is_admin());
drop policy if exists "answers read" on public.answers;
create policy "answers read" on public.answers for select to authenticated using (true);
drop policy if exists "answers insert" on public.answers;
create policy "answers insert" on public.answers for insert to authenticated with check (senior_id = auth.uid() and public.is_verified_senior());
drop policy if exists "answers delete" on public.answers;
create policy "answers delete" on public.answers for delete to authenticated using (senior_id = auth.uid() or public.is_admin());
drop policy if exists "thanks read" on public.thanks;
create policy "thanks read" on public.thanks for select to authenticated using (true);
drop policy if exists "thanks insert" on public.thanks;
create policy "thanks insert" on public.thanks for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.answers a join public.questions q on q.id = a.question_id where a.id = answer_id and q.asker_id = auth.uid()));
drop policy if exists "thanks delete" on public.thanks;
create policy "thanks delete" on public.thanks for delete to authenticated using (user_id = auth.uid());

drop policy if exists "stories read" on public.stories;
create policy "stories read" on public.stories for select to authenticated using (status = 'published' or author_id = auth.uid() or public.is_admin());
drop policy if exists "stories insert" on public.stories;
create policy "stories insert" on public.stories for insert to authenticated with check (author_id = auth.uid() and (status = 'draft' or (status = 'pending' and public.can_contribute())));
drop policy if exists "stories update own" on public.stories;
create policy "stories update own" on public.stories for update to authenticated using (author_id = auth.uid() and status <> 'published')
  with check (author_id = auth.uid() and (status = 'draft' or (status = 'pending' and public.can_contribute())));
drop policy if exists "stories admin update" on public.stories;
create policy "stories admin update" on public.stories for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "stories delete" on public.stories;
create policy "stories delete" on public.stories for delete to authenticated using (author_id = auth.uid() or public.is_admin());

drop policy if exists "posts read" on public.posts;
create policy "posts read" on public.posts for select to authenticated using (true);
drop policy if exists "posts insert" on public.posts;
create policy "posts insert" on public.posts for insert to authenticated with check (author_id = auth.uid() and public.can_contribute());
drop policy if exists "posts delete" on public.posts;
create policy "posts delete" on public.posts for delete to authenticated using (author_id = auth.uid() or public.is_admin());
drop policy if exists "reactions read" on public.post_reactions;
create policy "reactions read" on public.post_reactions for select to authenticated using (true);
drop policy if exists "reactions insert" on public.post_reactions;
create policy "reactions insert" on public.post_reactions for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "reactions delete" on public.post_reactions;
create policy "reactions delete" on public.post_reactions for delete to authenticated using (user_id = auth.uid());

drop policy if exists "listings read" on public.listings;
create policy "listings read" on public.listings for select to authenticated using (active or seller_id = auth.uid() or public.is_admin());
drop policy if exists "listings insert" on public.listings;
create policy "listings insert" on public.listings for insert to authenticated with check (seller_id = auth.uid());
drop policy if exists "listings update" on public.listings;
create policy "listings update" on public.listings for update to authenticated using (seller_id = auth.uid() or public.is_admin()) with check (seller_id = auth.uid() or public.is_admin());
drop policy if exists "listings delete" on public.listings;
create policy "listings delete" on public.listings for delete to authenticated using (seller_id = auth.uid() or public.is_admin());

drop policy if exists "events read" on public.events;
create policy "events read" on public.events for select to authenticated using (status = 'approved' or host_id = auth.uid() or public.is_admin());
drop policy if exists "events propose" on public.events;
create policy "events propose" on public.events for insert to authenticated with check (host_id = auth.uid() and status = 'pending' and public.is_verified_senior());
drop policy if exists "events admin" on public.events;
create policy "events admin" on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "rsvps own" on public.event_rsvps;
create policy "rsvps own" on public.event_rsvps for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- private storage bucket for verification proofs
insert into storage.buckets (id, name, public) values ('proofs', 'proofs', false) on conflict (id) do nothing;
drop policy if exists "proofs insert own" on storage.objects;
create policy "proofs insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "proofs read own or admin" on storage.objects;
create policy "proofs read own or admin" on storage.objects for select to authenticated
  using (bucket_id = 'proofs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- AFTER you sign up in the app, make yourself admin:
-- update public.profiles set is_admin = true where lower(username) = lower('YOUR_USERNAME');
