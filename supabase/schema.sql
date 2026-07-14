-- 두루두루 디저트 카페 - Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에서 전체 실행

-- 카테고리
create table public.categories (
  id text primary key,
  name text not null,
  label text not null,
  description text
);

-- 메뉴
create table public.menus (
  id text primary key,
  category_id text references public.categories(id),
  name text not null,
  english_name text,
  price jsonb not null default '{}'::jsonb,
  image text,
  description text,
  tags text[] default '{}',
  options jsonb default '{}'::jsonb,
  addons jsonb default '[]'::jsonb,
  is_sold_out boolean not null default false,
  is_recommended boolean not null default false
);

-- 회원 부가정보 (인증 자체는 Supabase Auth의 auth.users가 담당)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  signup_coupon_used boolean not null default false
);

-- 회원가입 시 profiles 행 자동 생성
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 주문
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  items jsonb not null,
  subtotal integer not null,
  discount integer not null default 0,
  coupon_applied boolean not null default false,
  signup_coupon_applied boolean not null default false,
  total_price integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.categories enable row level security;
alter table public.menus enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;

-- 메뉴/카테고리: 누구나 조회 가능
create policy "categories are viewable by everyone" on public.categories
  for select using (true);

create policy "menus are viewable by everyone" on public.menus
  for select using (true);

-- profiles: 본인 것만 조회/수정
create policy "users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- orders: 본인 주문만 조회/생성
create policy "users can view own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "users can insert own orders" on public.orders
  for insert with check (auth.uid() = user_id);

-- 테이블 권한 부여 (RLS 정책과 별개로 필요 — 이게 없으면 RLS 통과해도 permission denied)
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.menus to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert on public.orders to authenticated;
