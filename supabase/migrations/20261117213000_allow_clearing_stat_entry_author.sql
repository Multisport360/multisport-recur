-- Stat entries are never overwritten, with one exception: when the login that entered a
-- number is deleted, Postgres clears stat_entries.created_by (on delete set null).
-- The old rule blocked that too, so deleting a parent or athlete login that had entered
-- any number failed. Allow exactly that change and nothing else.

create or replace function private.block_stat_entry_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.created_by is not null
     and new.created_by is null
     and (to_jsonb(new) - 'created_by') = (to_jsonb(old) - 'created_by') then
    return new;
  end if;

  raise exception 'stat_entry_locked: stat entries are never changed; add a new entry instead'
    using errcode = 'P0001';
end;
$$;
