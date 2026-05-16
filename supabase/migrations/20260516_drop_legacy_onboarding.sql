-- Drop legacy onboarding tables.
-- member_tokens + leads: superseded by Supabase Auth (auth.users + profiles).
-- cv_submissions: CV service was dropped 2026-05-15.
-- Run AFTER 20260516_assessments_user_id.sql (which removes the assessments → member_tokens FK).

drop table if exists member_tokens cascade;
drop table if exists cv_submissions cascade;
drop table if exists leads cascade;
