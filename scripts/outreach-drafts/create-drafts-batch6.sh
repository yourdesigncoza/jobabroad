#!/usr/bin/env bash
# Batch 6: Accounting recipients added after the accounting pathway guide was
# published (2026-05-15). One genuinely new contact (FinGlobal) plus
# accounting-specific top-up drafts to four firms already contacted in earlier
# batches (Apostil, Sable, Four Corners, Intergate) — these are now also
# referenced from the accountants pathway and benefit from a separate pitch.
#
# Regulators (SAICA, CA ANZ, ICAEW, CPA Canada, CAI, ICAS, NASBA, AICPA,
# CIMA, ACCA) are excluded per the recruiters/agencies-only scope rule.
#
# Recipients in this batch (with confirmed public emails):
#   #37 Apostil (accounting) — clients@apostil.co.za
#   #38 Sable International (accounting) — immigration@sableinternational.com
#   #39 Four Corners Emigration (accounting) — info@four-corners.co.za
#   #40 Intergate Emigration (accounting) — info@intergate-emigration.com
#   #41 FinGlobal — info@finglobal.com (NEW)
#
# All emails confirmed 2026-05-15 via defuddle (Apostil, FinGlobal) and
# Brave search (Intergate, Sable).
#
# Usage:
#   ./create-drafts-batch6.sh              # creates drafts in Gmail
#   ./create-drafts-batch6.sh --dry-run    # prints what would be created
#
# DRAFTS ONLY — never sends. --gmail-no-send is set unconditionally as a
# belt-and-braces guard.

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
    --gmail-no-send \
    "${DRY_RUN_FLAG[@]}" \
    --plain
  echo
}

create_draft \
  "#37 Apostil (accounting)" \
  "clients@apostil.co.za" \
  "" \
  "Apostil on the new Jobabroad accountants pathway: courtesy heads-up" \
  "$BODIES_DIR/37-apostil-accounting.txt"

create_draft \
  "#38 Sable International (accounting)" \
  "immigration@sableinternational.com" \
  "" \
  "Sable on the new Jobabroad accountants pathway: courtesy heads-up" \
  "$BODIES_DIR/38-sable-accounting.txt"

create_draft \
  "#39 Four Corners Emigration (accounting)" \
  "info@four-corners.co.za" \
  "" \
  "Four Corners on the new Jobabroad accountants pathway: courtesy heads-up" \
  "$BODIES_DIR/39-four-corners-accounting.txt"

create_draft \
  "#40 Intergate Emigration (accounting)" \
  "info@intergate-emigration.com" \
  "" \
  "Intergate on the new Jobabroad accountants pathway: courtesy heads-up" \
  "$BODIES_DIR/40-intergate-accounting.txt"

create_draft \
  "#41 FinGlobal" \
  "info@finglobal.com" \
  "" \
  "Mentioning FinGlobal on the new Jobabroad accountants pathway: courtesy heads-up" \
  "$BODIES_DIR/41-finglobal.txt"

echo "Done. Open Gmail → Drafts to review."
