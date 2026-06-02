-- Track when the admin "new user confirmed" notification was sent for a profile.
-- Set once, the first time a newly-registered user confirms their email (via
-- /auth/callback). Makes the notification idempotent: a resend-confirmation
-- that mints a fresh code, or any repeat callback hit, won't email the admin
-- twice. Sits on top of the supabase/db-may-18.md snapshot.
-- Apply via Supabase dashboard SQL editor.

alter table profiles
  add column if not exists admin_notified_at timestamptz;
