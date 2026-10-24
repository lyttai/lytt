create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  age_confirmed boolean not null,
  terms_accepted_at timestamptz not null default now(),
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title_enc text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content_enc text not null,
  created_at timestamptz not null default now()
);

create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 0
);

create index chats_user_updated on public.chats (user_id, updated_at desc);
create index messages_chat_created on public.messages (chat_id, created_at);

alter table public.profiles enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.rate_limits enable row level security;

create policy "own profile read" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own chats read" on public.chats for select to authenticated using (user_id = (select auth.uid()));
create policy "own chats insert" on public.chats for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own chats update" on public.chats for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own chats delete" on public.chats for delete to authenticated using (user_id = (select auth.uid()));

create policy "own messages read" on public.messages for select to authenticated using (user_id = (select auth.uid()));
create policy "own messages insert" on public.messages for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.chats c where c.id = chat_id and c.user_id = (select auth.uid())));

revoke all on public.rate_limits from anon, authenticated;
revoke insert, delete on public.profiles from anon, authenticated;
revoke update on public.profiles from authenticated;
grant update (marketing_opt_in) on public.profiles to authenticated;

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce((new.raw_user_meta_data ->> 'age_confirmed')::boolean, false) is not true then
    raise exception 'age confirmation required';
  end if;
  insert into public.profiles (id, age_confirmed) values (new.id, true);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create function public.hit_rate_limit(p_key text, p_max integer, p_seconds integer) returns boolean language plpgsql security definer set search_path = '' as $$
declare c integer;
begin
  delete from public.rate_limits where window_start < now() - interval '1 day';
  insert into public.rate_limits as r (key, window_start, count) values (p_key, now(), 1)
  on conflict (key) do update set
    count = case when r.window_start < now() - make_interval(secs => p_seconds) then 1 else r.count + 1 end,
    window_start = case when r.window_start < now() - make_interval(secs => p_seconds) then now() else r.window_start end
  returning count into c;
  return c <= p_max;
end $$;

create function public.unsubscribe_email(p_email text) returns void language sql security definer set search_path = '' as $$
  update public.profiles set marketing_opt_in = false where id = (select id from auth.users where email = lower(p_email));
$$;

revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.unsubscribe_email(text) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;
grant execute on function public.unsubscribe_email(text) to service_role;

create function public.purge_user_logs(p_user uuid) returns void language sql security definer set search_path = '' as $$
  delete from auth.audit_log_entries where payload ->> 'actor_id' = p_user::text or payload -> 'traits' ->> 'user_id' = p_user::text;
  delete from public.rate_limits where key = 'chat:' || p_user::text;
$$;

revoke all on function public.purge_user_logs(uuid) from public, anon, authenticated;
grant execute on function public.purge_user_logs(uuid) to service_role;
