alter table public.sessions
  add column if not exists theme text default 'classic',
  add column if not exists max_chars integer default 30,
  add column if not exists allow_emoji boolean default true,
  add column if not exists allow_name boolean default true;

update public.sessions
set theme = coalesce(theme, 'classic'),
    max_chars = coalesce(max_chars, 30),
    allow_emoji = coalesce(allow_emoji, true),
    allow_name = coalesce(allow_name, true)
where theme is null
   or max_chars is null
   or allow_emoji is null
   or allow_name is null;
