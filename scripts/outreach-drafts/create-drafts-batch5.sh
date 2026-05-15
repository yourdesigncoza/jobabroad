#!/usr/bin/env bash
# Batch 5: Engineering recipients added after the engineering pathway guide
# was published (2026-05-14). Regulators (ECSA, Engineers Australia,
# Engineering New Zealand, Engineering Council UK, Engineers Ireland, WES)
# are excluded per the recruiters/agencies-only scope rule.
#
# Recipients in this batch (with confirmed public emails):
#   #36 Move Up — info@moveup.co.za (general inquiries, surfaced from
#                  ukjobs.moveup.co.za contact section via Interceptor)
#
# Other engineering-adjacent migration consultancies still form-only (not
# in this batch — surface email via Google "email address for <domain>"
# before queueing a draft):
#   - Sable International (already in batch 2 as #18, form-only)
#   - Intergate Emigration (already in batch 2 as #21, form-only)
#   - Breytenbachs / BIC (bic-immigration.com)
#   - Network Migration Services (already in batch 2 as #23, form-only)
#
# Usage:
#   ./create-drafts-batch5.sh              # creates drafts in Gmail
#   ./create-drafts-batch5.sh --dry-run    # prints what would be created

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
  "#36 Move Up" \
  "info@moveup.co.za" \
  "" \
  "Mentioning Move Up on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/36-moveup.txt"

echo "Done. Open Gmail → Drafts to review."
