#!/usr/bin/env bash
# Batch 4: Au-pair recipients added after the au-pair pathway guide was
# published (2026-05-13). Government bodies (US State Dept ECA, IND, BAMF,
# OFII, etc.) are excluded per the recruiters/agencies-only scope rule.
#
# Recipients in this batch (with confirmed public emails):
#   #29 Cultural Care Au Pair (Cape Town office)
#   #30 Au Pair in America / AIFS (via African Ambassadors SA)
#   #31 AuPairCare
#   #35 OVC South Africa (Admin1@ovc.co.za — head-office admin address)
#
# Recipients in batch 4 that are form-only (no public email surfaced):
#   #32 EurAuPair — euraupair.com (USA J-1 sponsor)
#   #33 Go Au Pair — goaupair.com (USA J-1 sponsor)
#   #34 GreatAuPair — greataupair.com (USA J-1 sponsor + matching platform)
#
# For form-only recipients, run a Google search ("email address for <domain>")
# in your browser to surface addresses before treating them as form-only.
#
# Usage:
#   ./create-drafts-batch4.sh              # creates drafts in Gmail
#   ./create-drafts-batch4.sh --dry-run    # prints what would be created

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
  "#29 Cultural Care Au Pair" \
  "capetown@culturalcare.com" \
  "" \
  "Mentioning Cultural Care on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/29-cultural-care.txt"

create_draft \
  "#30 Au Pair in America / African Ambassadors" \
  "info@aupairinamerica.co.za" \
  "" \
  "Mentioning Au Pair in America on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/30-aupairinamerica.txt"

create_draft \
  "#31 AuPairCare" \
  "customercare@aupaircare.com" \
  "" \
  "Mentioning AuPairCare on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/31-aupaircare.txt"

create_draft \
  "#35 OVC South Africa" \
  "Admin1@ovc.co.za" \
  "" \
  "Mentioning OVC on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/35-ovc.txt"

echo "Done. Open Gmail → Drafts to review."
