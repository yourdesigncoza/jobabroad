#!/usr/bin/env bash
# Create Gmail drafts for the 5 remaining email-addressable recipients in the
# Jobabroad outreach batch. Runs gog gmail drafts create once per recipient with
# the From alias info@devai.co.za, the destination To/CC, the subject line, and
# the body file.
#
# Requires:
#   - gog v0.16.0 or later on PATH
#   - GOG_KEYRING_BACKEND, GOG_KEYRING_PASSWORD, GOG_ACCOUNT set in the calling
#     shell (e.g. via ~/.bashrc) OR exported before running this script
#   - The Gmail "Send mail as" alias info@devai.co.za already verified
#
# Usage:
#   ./create-drafts.sh              # creates 5 drafts in Gmail
#   ./create-drafts.sh --dry-run    # prints what would be created, no API calls
#
# Notes:
#   - Re-running creates duplicate drafts. Delete extras in Gmail if you re-run.
#   - The script is idempotent in shell semantics only: each invocation is one
#     side-effecting batch.

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
  "#1 Global Nurse Force" \
  "info@globalnurseforce.com" \
  "" \
  "Mentioning Global Nurse Force on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/01-global-nurse-force.txt"

create_draft \
  "#4 Gesundheit Personal Netz" \
  "info.global@gesundheit-pn.de" \
  "info@gesundheit-pn.de" \
  "Listing Gesundheit Personal Netz on Jobabroad: courtesy note" \
  "$BODIES_DIR/04-gesundheit.txt"

create_draft \
  "#17 Apostil.co.za" \
  "clients@apostil.co.za" \
  "" \
  "Mentioning Apostil.co.za on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/17-apostil.txt"

create_draft \
  "#20 Four Corners Emigration" \
  "info@four-corners.co.za" \
  "info@four-corners.com.au" \
  "Mentioning Four Corners Emigration on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/20-four-corners.txt"

create_draft \
  "#23 Network Migration Services" \
  "andrew@networkmigration.com" \
  "" \
  "Mentioning Network Migration Services on Jobabroad: courtesy heads-up" \
  "$BODIES_DIR/23-network-migration.txt"

echo "Done. Open Gmail → Drafts to review."
