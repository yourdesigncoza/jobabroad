-- Step 3 of paid-flow refactor: store the admin's post-call notes alongside
-- the cached PDF row. Step 4 will render them in the template; this migration
-- just adds the column so the generator can persist them today.
--
-- Nullable + no default = backward-compat. Existing rows untouched.

alter table paid_reports
  add column call_notes text;
