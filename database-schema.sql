-- ============================================================
-- CBG InfoTech — Supabase schema
-- ============================================================
-- Run this against a fresh Supabase project to recreate the
-- database structure, RLS policies, triggers, and grants.
--
-- Notes:
--   * The `auth` schema (auth.users) is managed by Supabase.
--     This file only references it, never creates it.
--   * The storage bucket and its policies are created at the
--     bottom of this file.
--   * This file contains no secrets.
-- ============================================================


-- ============================================================
-- 1. Tables
-- ============================================================

-- profiles: extends auth.users with app-specific fields.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

-- addresses: saved shipping addresses per user.
create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  label text,
  name text not null,
  phone text not null,
  street text not null,
  city text not null,
  state text not null,
  postal text not null,
  is_default boolean not null default false,
  created_at timestamptz default now()
);

-- orders: the order record. Snapshots customer/address/items so past
-- orders don't change if source data changes later.
create table orders (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'awaiting_payment_receipt',
  customer jsonb not null,
  address jsonb,
  delivery text not null check (delivery in ('ship', 'pickup')),
  items jsonb not null,
  subtotal numeric not null,
  discount numeric not null default 0,
  coupon jsonb,
  shipping numeric not null default 0,
  total numeric not null,
  payment_method text not null,
  receipt_file_name text,
  receipt_uploaded_at timestamptz,
  receipt_path text,
  created_at timestamptz default now()
);


-- ============================================================
-- 2. Sequence for order ID generation
-- ============================================================

create sequence if not exists order_number_seq start 1;


-- ============================================================
-- 3. Functions
-- ============================================================

-- is_admin(): returns true if the current user has role = 'admin'.
-- security definer so it can read profiles without recursive RLS issues.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- handle_new_user(): creates a profile row when a new auth user signs up.
-- Reads name and phone from raw_user_meta_data (passed via signUp).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'New User'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

-- set_order_id(): fills the order id from the sequence on insert,
-- if the caller didn't supply one.
create or replace function public.set_order_id()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is null or new.id = '' then
    new.id := 'ORD-' || to_char(now(), 'YYYY') || '-' ||
              lpad(nextval('order_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

-- prevent_order_tampering(): blocks non-admins from changing any
-- order column except receipt fields; restricts status transitions;
-- validates the receipt path belongs to the caller; makes the receipt
-- immutable once set.
create or replace function public.prevent_order_tampering()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    if new.id is distinct from old.id
      or new.user_id is distinct from old.user_id
      or new.customer is distinct from old.customer
      or new.address is distinct from old.address
      or new.delivery is distinct from old.delivery
      or new.items is distinct from old.items
      or new.subtotal is distinct from old.subtotal
      or new.discount is distinct from old.discount
      or new.coupon is distinct from old.coupon
      or new.shipping is distinct from old.shipping
      or new.total is distinct from old.total
      or new.payment_method is distinct from old.payment_method
      or new.created_at is distinct from old.created_at
    then
      raise exception 'Only receipt fields can be updated on your own order';
    end if;

    -- Status can only go from awaiting_payment_receipt to verifying.
    if new.status is distinct from old.status then
      if not (old.status = 'awaiting_payment_receipt' and new.status = 'verifying') then
        raise exception 'Invalid status transition';
      end if;
    end if;

    -- Receipt path must belong to the current user.
    if new.receipt_path is not null then
      if new.receipt_path not like (auth.uid()::text || '/%') then
        raise exception 'Invalid receipt path';
      end if;
    end if;

    -- Receipt is immutable once set.
    if old.receipt_path is not null
       and new.receipt_path is distinct from old.receipt_path then
      raise exception 'Receipt has already been submitted';
    end if;
  end if;

  return new;
end;
$$;

-- prevent_profile_escalation(): blocks non-admins from changing their
-- own role, id, or created_at on the profiles table.
create or replace function public.prevent_profile_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not is_admin() then
    raise exception 'Cannot change your own role';
  end if;

  if not is_admin() then
    if new.id is distinct from old.id
      or new.created_at is distinct from old.created_at
    then
      raise exception 'Protected fields cannot be modified';
    end if;
  end if;

  return new;
end;
$$;


-- ============================================================
-- 4. Triggers
-- ============================================================

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger set_order_id
  before insert on orders
  for each row execute function public.set_order_id();

create trigger prevent_order_tampering
  before update on orders
  for each row execute function public.prevent_order_tampering();

create trigger prevent_profile_escalation
  before update on profiles
  for each row execute function public.prevent_profile_escalation();


-- ============================================================
-- 5. Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;


-- ============================================================
-- 6. RLS Policies
-- ============================================================

-- profiles
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (is_admin());

-- addresses
create policy "Users manage own addresses"
  on addresses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins view all addresses"
  on addresses for select
  using (is_admin());

-- orders
create policy "Users view own orders"
  on orders for select
  using (auth.uid() = user_id);

create policy "Users create own orders"
  on orders for insert
  with check (auth.uid() = user_id);

create policy "Users update own receipt"
  on orders for update
  using (auth.uid() = user_id);

create policy "Admins view all orders"
  on orders for select
  using (is_admin());

create policy "Admins update all orders"
  on orders for update
  using (is_admin());


-- ============================================================
-- 7. Grants
-- ============================================================
-- Revoke everything from anon. Grant only what authenticated needs.

revoke all on public.profiles from anon;
revoke all on public.addresses from anon;
revoke all on public.orders from anon;

revoke all on public.profiles from authenticated;
revoke all on public.addresses from authenticated;
revoke all on public.orders from authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.addresses to authenticated;
grant select, insert, update on public.orders to authenticated;

grant usage, select on sequence public.order_number_seq to authenticated;

-- Function execution
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.prevent_order_tampering() from public, anon, authenticated;


-- ============================================================
-- 8. Storage bucket and policies
-- ============================================================
-- The receipts bucket is private. Files are stored at
-- {user_id}/{order_id}/{filename}. RLS restricts access to the
-- file's owner, with an admin read override.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 10485760, array['image/*', 'application/pdf'])
on conflict (id) do nothing;

create policy "Users upload own receipts"
  on storage.objects for insert
  with check (
    bucket_id = 'receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users read own receipts"
  on storage.objects for select
  using (
    bucket_id = 'receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users update own receipts"
  on storage.objects for update
  using (
    bucket_id = 'receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins read all receipts"
  on storage.objects for select
  using (
    bucket_id = 'receipts'
    and public.is_admin()
  );