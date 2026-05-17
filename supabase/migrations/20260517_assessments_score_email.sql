-- Track whether we've already emailed the user the score-page summary.
-- Set on the FIRST /score page load by the server component; subsequent
-- visits do not re-send. Nullable + no default = backward-compat.

alter table assessments
  add column score_email_sent_at timestamptz;
