-- =====================================================================
-- 統測英文倒數 · Supabase 資料庫設定
-- 用法：Supabase 後台 → SQL Editor → New query → 貼上整份 → Run。
-- 重複執行也安全（不會刪掉已經存在的帳號或紀錄）。
--
-- 安全規則（Row Level Security）：
--   · 學生只能讀寫「自己的」學習紀錄，看不到別的學生。
--   · 老師可以看所有學生的紀錄，也只有老師能改共用教材。
--   · 帳號是學生還是老師，只有資料庫能決定；網頁改不了。
--   · 老師邀請碼存在 private 結構裡，任何人都無法從網頁讀到。
-- =====================================================================

-- ---------- 1. 資料表 ----------

-- 每個帳號一列，註冊時自動建立（見第 4 節）
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text not null default '' check (char_length(name) <= 60),
  role text not null default 'student' check (role in ('student', 'teacher')),
  created_at timestamptz not null default now()
);

-- 每個帳號的學習紀錄（一整包 JSON）
create table if not exists public.progress (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 一份紀錄最多 2 MB（實際使用通常不到 1 MB）
alter table public.progress drop constraint if exists progress_data_check;
alter table public.progress drop constraint if exists progress_size;
alter table public.progress add constraint progress_size check (octet_length(data::text) <= 2000000);

-- 老師的共用教材（只有一列，id = 'main'）
create table if not exists public.content (
  id text primary key default 'main' check (id = 'main'),
  data jsonb not null default '{}'::jsonb check (octet_length(data::text) <= 20000000),
  updated_at timestamptz not null default now()
);

-- 老師邀請碼：放在不對外開放的 private 結構
create schema if not exists private;
create table if not exists private.app_secrets (
  key text primary key,
  value text not null
);

-- ---------- 2. 權限：先全部收回，再只開放網頁需要的 ----------

revoke all on schema private from public, anon, authenticated;
revoke all on private.app_secrets from public, anon, authenticated;

revoke all on public.profiles, public.progress, public.content from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update on public.progress to authenticated;
grant select, insert, update on public.content to authenticated;

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.content enable row level security;

-- ---------- 3. 小工具函式 ----------

-- 目前登入的人是不是老師
create or replace function public.is_teacher() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'teacher');
$$;

-- 更新時間由資料庫自己蓋章
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- 大份紀錄 3 秒內只能改一次，避免有人用大量寫入塞爆免費方案的空間（網站本身的同步間隔比這更長）
create or replace function public.progress_guard() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if octet_length(new.data::text) > 300000 and old.updated_at > now() - interval '3 seconds' then
    raise exception 'progress saved too often' using errcode = '54000';
  end if;
  return new;
end;
$$;
drop trigger if exists progress_guard on public.progress;
create trigger progress_guard before update on public.progress
  for each row execute function public.progress_guard();

drop trigger if exists progress_touch on public.progress;
create trigger progress_touch before insert or update on public.progress
  for each row execute function public.touch_updated_at();
drop trigger if exists content_touch on public.content;
create trigger content_touch before insert or update on public.content
  for each row execute function public.touch_updated_at();

-- ---------- 4. email 確認後自動建立 profile ----------
-- 還沒確認 email 的註冊不會出現在老師的名單上（關掉 Confirm email 時，註冊當下就算確認）。
-- 角色一律是 student；只有註冊時填的邀請碼和老師設定的一樣（至少 8 個字），才會變成 teacher。
-- 有人連續猜錯 20 次，邀請碼會自動作廢，老師到「設定」重設一個新的即可。

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  given text := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'teacher_code', '')), '');
  secret text;
  misses int;
  make_teacher boolean := false;
begin
  select value into secret from private.app_secrets where key = 'teacher_code';
  if given is not null and secret is not null then
    if char_length(secret) >= 8 and given = secret then
      make_teacher := true;
      delete from private.app_secrets where key = 'teacher_code_misses';
    else
      insert into private.app_secrets (key, value) values ('teacher_code_misses', '1')
      on conflict (key) do update set value = ((private.app_secrets.value)::int + 1)::text
      returning value::int into misses;
      if misses >= 20 then
        delete from private.app_secrets where key in ('teacher_code', 'teacher_code_misses');
      end if;
    end if;
  end if;
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), split_part(coalesce(new.email, ''), '@', 1)), 60),
    case when make_teacher then 'teacher' else 'student' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row when (new.email_confirmed_at is not null) execute function public.handle_new_user();
drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed after update of email_confirmed_at on auth.users
  for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null) execute function public.handle_new_user();

-- 在這份設定之前就已經註冊（並確認 email）的帳號，補上 profile（一律是學生）
insert into public.profiles (id, email, name)
select id, email, left(split_part(coalesce(email, ''), '@', 1), 60) from auth.users where email_confirmed_at is not null
on conflict (id) do nothing;

-- ---------- 5. 老師設定 / 查看邀請碼（網頁的「設定」頁會用到） ----------
-- 空白＝清除邀請碼（關閉老師註冊）。

create or replace function public.set_teacher_code(new_code text) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_teacher() then
    raise exception 'only teachers can change the invite code' using errcode = '42501';
  end if;
  new_code := btrim(coalesce(new_code, ''));
  delete from private.app_secrets where key = 'teacher_code_misses';
  if new_code = '' then
    delete from private.app_secrets where key = 'teacher_code';
    return;
  end if;
  if char_length(new_code) < 8 or char_length(new_code) > 100 then
    raise exception 'invite code must be 8-100 characters' using errcode = '22023';
  end if;
  insert into private.app_secrets (key, value) values ('teacher_code', new_code)
  on conflict (key) do update set value = excluded.value;
end;
$$;

create or replace function public.get_teacher_code() returns text
language sql stable security definer set search_path = ''
as $$
  select value from private.app_secrets where key = 'teacher_code' and public.is_teacher();
$$;

revoke execute on function public.is_teacher(), public.set_teacher_code(text), public.get_teacher_code(),
  public.handle_new_user(), public.touch_updated_at(), public.progress_guard() from public, anon, authenticated;
grant execute on function public.is_teacher(), public.set_teacher_code(text), public.get_teacher_code() to authenticated;

-- ---------- 6. 誰可以讀寫哪些資料 ----------

drop policy if exists "profiles: own or teacher" on public.profiles;
create policy "profiles: own or teacher" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_teacher()));

drop policy if exists "progress: read own or teacher" on public.progress;
create policy "progress: read own or teacher" on public.progress
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_teacher()));

drop policy if exists "progress: add own" on public.progress;
create policy "progress: add own" on public.progress
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "progress: update own" on public.progress;
create policy "progress: update own" on public.progress
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "content: signed-in users read" on public.content;
create policy "content: signed-in users read" on public.content
  for select to authenticated
  using (true);

drop policy if exists "content: teachers add" on public.content;
create policy "content: teachers add" on public.content
  for insert to authenticated
  with check ((select public.is_teacher()));

drop policy if exists "content: teachers update" on public.content;
create policy "content: teachers update" on public.content
  for update to authenticated
  using ((select public.is_teacher()))
  with check ((select public.is_teacher()));

-- =====================================================================
-- 第一個老師帳號：先在網頁上用你的 email 註冊（身分選學生就好），
-- 然後把下面這行的 email 換成你的，拿掉開頭的 -- 再按 Run：
--
-- update public.profiles set role = 'teacher' where id = (select id from auth.users where email = lower('你的email@example.com')) returning email, role;
-- 結果出現一列、role 是 teacher 才算成功。
--
-- 之後若有其他老師，到網頁「設定」頁設定老師邀請碼（至少 8 個字，建議 10 個字以上、不要用好猜的字），
-- 他們註冊時填這個碼就會是老師；用完清空即可關閉老師註冊。
-- =====================================================================
