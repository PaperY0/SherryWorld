-- Run once in this Supabase project's SQL Editor. Safe to run again.
create table if not exists public.sherry_site_content (
  id text primary key check (id = 'main'),
  content jsonb not null,
  revision text not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.sherry_site_backups (
  id bigint generated always as identity primary key,
  content jsonb not null,
  revision text not null,
  created_at timestamptz not null default now()
);
alter table public.sherry_site_content enable row level security;
alter table public.sherry_site_backups enable row level security;
revoke all on public.sherry_site_content, public.sherry_site_backups from anon, authenticated;
grant all on public.sherry_site_content, public.sherry_site_backups to service_role;
grant usage, select on sequence public.sherry_site_backups_id_seq to service_role;

create or replace function public.sherry_save_content(expected_revision text, next_content jsonb, next_revision text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare previous public.sherry_site_content%rowtype;
begin
  select * into previous from public.sherry_site_content where id = 'main' for update;
  if not found or previous.revision <> expected_revision then
    raise exception 'CONFLICT' using errcode = 'P0001';
  end if;
  insert into public.sherry_site_backups(content, revision) values(previous.content, previous.revision);
  update public.sherry_site_content set content = next_content, revision = next_revision, updated_at = now() where id = 'main';
  return jsonb_build_object('content', next_content, 'revision', next_revision);
end;
$$;
revoke all on function public.sherry_save_content(text,jsonb,text) from public, anon, authenticated;
grant execute on function public.sherry_save_content(text,jsonb,text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('sherry-media','sherry-media',false,15728640,array['image/png','image/jpeg','image/webp','image/gif'])
on conflict(id) do nothing;
notify pgrst, 'reload schema';
