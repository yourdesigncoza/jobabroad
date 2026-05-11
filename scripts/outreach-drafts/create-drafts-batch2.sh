#!/usr/bin/env bash
# Batch 2: the 5 recipients we previously thought were form-only but actually
# have usable public email addresses (surfaced 2026-05-11). Same draft-creation
# pattern as create-drafts.sh, but as a separate script so re-running batch 1
# never duplicates batch 2 and vice versa.
#
# Recipients in this batch:
#   #2  Medipath Healthcare Recruitment
#   #7  Engage Education
#   #9  Tradewind Recruitment
#   #14 CSCS (Construction Skills Certification Scheme)
#   #21 Intergate Emigration
#
# Usage:
#   ./create-drafts-batch2.sh              # creates 5 drafts in Gmail
#   ./create-drafts-batch2.sh --dry-run    # prints what would be created
#
# See create-drafts.sh for the original batch 1 (5 recipients) and the shared
# `gog` setup notes in docs/outreach-emails.md.

set -euo pipefail

BODIES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/bodies"
FROM='info@devai.co.za'

DRY_RUN_FLAG=()
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN_FLAG=(--dry-run)
  echo "DRY RUN: no drafts will be created"
  echo
fi

create_draft() {
  local label="$1"
  local to="$2"
  local cc="$3"
  local subject="$4"
  local body_file="$5"

  if [[ ! -f "$body_file" ]]; then
    echo "ERROR: missing body file: $body_file" >&2
    return 1
  fi

  echo "→ $label"
  echo "  To: $to"
  [[ -n "$cc" ]] && echo "  CC: $cc"
  echo "  Subject: $subject"
  echo "  Body: $body_file ($(wc -l <"$body_file") lines)"

  local cc_args=()
  [[ -n "$cc" ]] && cc_args=(--cc "$cc")

  gog gmail drafts create \
    --from "$FROM" \
    --to "$to" \
    "${cc_args[@]}" \
    --subject "$subject" \
    --body-file "$body_file" \
    "${DRY_RUN_FLAG[@]}" \
    --plain
  echo
}

create_draft \
  "#2 Medipath Healthcare Recruitment" \
  "info@medipath.co.za" \
  "" \
  "Mentioning Medipath on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/02-medipath.txt"

create_draft \
  "#7 Engage Education" \
  "Customercare@engage-education.com" \
  "" \
  "Mentioning Engage Education on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/07-engage-education.txt"

create_draft \
  "#9 Tradewind Recruitment" \
  "london@twrecruitment.com" \
  "" \
  "Mentioning Tradewind on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/09-tradewind.txt"

create_draft \
  "#14 CSCS" \
  "Communications@cscs.co.uk" \
  "" \
  "Mentioning CSCS on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/14-cscs.txt"

create_draft \
  "#21 Intergate Emigration" \
  "teamsupport@intergate-emigration.com" \
  "" \
  "Mentioning Intergate Emigration on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/21-intergate.txt"

echo "Done. Open Gmail → Drafts to review."
