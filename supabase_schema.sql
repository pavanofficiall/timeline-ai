-- Supabase schema for timeline-ai
-- Run this in Supabase Dashboard -> SQL Editor

-- Ensure required extensions
create extension if not exists pgcrypto;

-- Enum for document processing status
do $$ begin
  if not exists (select 1 from pg_type where typname = 'document_status') then
    create type document_status as enum ('pending', 'processed');
  end if;
end $$;

-- documents table
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  file_url text not null,
  uploaded_at timestamptz not null default now(),
  status document_status not null default 'pending'
);

-- case_events table
create table if not exists public.case_events (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  date timestamptz,
  title text not null,
  description text,
  confidence_score numeric,
  created_at timestamptz not null default now()
);

-- case_parties table
create table if not exists public.case_parties (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  name text not null,
  role text not null,
  created_at timestamptz not null default now()
);

-- case_payments table
create table if not exists public.case_payments (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  amount numeric,
  currency text,
  payer text,
  payee text,
  date timestamptz,
  created_at timestamptz not null default now()
);

-- missing_documents table
create table if not exists public.missing_documents (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  description text not null,
  reason text,
  created_at timestamptz not null default now()
);

-- Create storage bucket 'documents' if it does not exist
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'documents') then
    perform storage.create_bucket('documents', public := false);
  end if;
end $$;

-- README / Instructions
-- 1) Open Supabase Dashboard -> SQL Editor
-- 2) Paste this entire script and run it
-- 3) Verify tables under public schema and the storage bucket named 'documents'

