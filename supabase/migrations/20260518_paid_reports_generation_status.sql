-- Paid reports generation status: observability + retry for the new pre-warmed
-- report generation flow. Webhook now inserts a paid_reports row at payment time
-- with status='pending' and no pdf_path yet; generateReport flips to 'completed'
-- when the PDF lands, or 'failed' on caught error. Dashboard polls this status.
-- Apply via Supabase dashboard SQL editor.

-- 1. Add the status columns.

alter table paid_reports
  add column generation_status text not null default 'completed'
    check (generation_status in ('pending', 'completed', 'failed')),
  add column generation_error text,
  add column generation_attempts int not null default 0,
  add column generation_started_at timestamptz,
  add column generation_completed_at timestamptz;

-- 2. pdf_path was NOT NULL because old flow only inserted on successful PDF write.
-- New flow inserts the row at payment time (status='pending') before the PDF
-- exists, so the column must allow null.

alter table paid_reports
  alter column pdf_path drop not null;

-- 3. Backfill: any existing row was written by the old flow only after a
-- successful PDF generation, so they're all 'completed'. The default above
-- already gives them 'completed', but set generation_completed_at explicitly
-- so dashboards/admin queries that sort by it don't see nulls for the backlog.

update paid_reports
   set generation_status = 'completed',
       generation_completed_at = generated_at
 where pdf_path is not null;
