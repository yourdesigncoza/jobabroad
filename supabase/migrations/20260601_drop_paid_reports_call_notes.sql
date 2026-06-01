-- Drop the dormant paid_reports.call_notes column. It backed the hand-written
-- post-call session-notes feature, which was retired when the review call
-- became optional and the report auto-generates on payment. Nothing in the app
-- reads or writes call_notes any longer (the /admin/post-call tool was
-- repurposed). Sits on top of the supabase/db-may-18.md snapshot.
-- Apply via Supabase dashboard SQL editor.

alter table paid_reports
  drop column if exists call_notes;
