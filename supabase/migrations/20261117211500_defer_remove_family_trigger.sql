-- Run the "remove a family with no parent left" check at the end of the transaction.
--
-- Deleting a parent's login cascades through several tables at once (guardians, and
-- stat_entries.created_by is set to null). Deleting the family in the middle of that cascade
-- touched the same stat_entries rows twice and Postgres refused the whole delete. A deferred
-- constraint trigger runs after every cascade has finished.

drop trigger guardians_remove_empty_family on public.guardians;

create constraint trigger guardians_remove_empty_family
  after delete on public.guardians
  deferrable initially deferred
  for each row execute function private.remove_family_without_guardians();
