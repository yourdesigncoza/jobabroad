#!/usr/bin/env bash
# Batch 3: TEFL recipients added after the TEFL pathway guide was published
# (2026-05-13). Government programmes (EPIK, GEPIK, SMOE, JET, Auxiliares de
# Conversación) are excluded from outreach per the recruiters/agencies-only
# scope rule.
#
# Recipients in this batch:
#   #24 Korvia Consulting (EPIK official recruiting partner, Korea)
#   #25 Travelbud (SA-domiciled TEFL placement agency, Cape Town)
#   #26 Teach Away (Toronto-based global TEFL recruiter)
#   #27 The TEFL Org (UK TEFL training + jobs board)
#   #28 CIEE (US Teach Abroad programme — practical Spain route since Auxiliares closed)
#
# Recipients in batch 3 that are form-only (no public email — handle separately):
#   #29 Footprints Recruiting — contact form at footprintsrecruiting.com/contact
#   #30 International TEFL Academy — contact form at internationalteflacademy.com
#   #31 i-to-i TEFL — contact form at i-to-i.com
#   #32 Reach to Teach — contact form at reachtoteach.com
#
# For form-only recipients, run a Google search ("email address for <domain>")
# in your browser to surface addresses before treating them as form-only.
#
# Usage:
#   ./create-drafts-batch3.sh              # creates draft(s) in Gmail
#   ./create-drafts-batch3.sh --dry-run    # prints what would be created
#
# See create-drafts.sh for batch 1 and create-drafts-batch2.sh for batch 2.

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
  "#24 Korvia Consulting" \
  "support@korvia.com" \
  "" \
  "Mentioning Korvia on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/24-korvia.txt"

create_draft \
  "#25 Travelbud" \
  "info@travelbud.com" \
  "" \
  "Mentioning TravelBud on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/25-travelbud.txt"

create_draft \
  "#26 Teach Away" \
  "info@teachaway.com" \
  "" \
  "Mentioning Teach Away on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/26-teach-away.txt"

create_draft \
  "#27 The TEFL Org" \
  "info@tefl.org" \
  "" \
  "Mentioning The TEFL Org on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/27-tefl-org.txt"

create_draft \
  "#28 CIEE" \
  "contact@ciee.org" \
  "" \
  "Mentioning CIEE on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/28-ciee.txt"

echo "Done. Open Gmail → Drafts to review."
