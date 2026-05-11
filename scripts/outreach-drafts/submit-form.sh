#!/usr/bin/env bash
# Clipboard helper for the 10 truly-form-only outreach recipients.
# Copies the message body to the Wayland clipboard, prints the metadata
# (name / email / subject) to the terminal, and opens the form URL in the
# default browser (Brave).
#
# Usage:
#   ./submit-form.sh <number>      e.g. ./submit-form.sh 3
#   ./submit-form.sh list          show all recipients
#
# Workflow per form:
#   1. ./submit-form.sh <N>  (terminal shows metadata, body lands on clipboard,
#                             browser opens to the form page)
#   2. In the form: type name, email, subject from the terminal output
#   3. In the message field: press Ctrl+V (or Cmd+V) to paste body
#   4. Solve any CAPTCHA, click Submit
#   5. Record the send in docs/outreach-emails.md status log
#
# Requires: wl-copy (Wayland clipboard), xdg-open (URL launcher).

set -euo pipefail

BODIES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/bodies"

NAME='John Montgomery'
EMAIL='info@devai.co.za'

# Recipient table: N|URL|SUBJECT|BODY_FILE
RECIPIENTS=(
  "5|https://www.healthcareers.nhs.uk/contact-us|Mentioning the NHS England international recruitment route on Jobabroad|05-nhs-england-irp.txt"
  "6|https://alorgroup.com.au/|Quick check: does ALOR Group still recruit SA nurses to Australia?|06-ahp-alor.txt"
  "8|https://impactteachers.com/contact-us/|Mentioning Impact Teachers on Jobabroad: courtesy heads-up|08-impact-teachers.txt"
  "11|https://www.tes.com/jobs/contact-us|Mentioning TES Jobs on Jobabroad: courtesy heads-up|11-tes.txt"
  "12|https://teaching-vacancies.service.gov.uk/contact-us|Mentioning Teaching Vacancies on Jobabroad: courtesy heads-up|12-teaching-vacancies.txt"
  "13|https://www.sa-recruitment.com/contact-us|Quick verification: listing SA-Recruitment on Jobabroad|13-sa-recruitment.txt"
  "18|https://www.sableinternational.com/contact-us|Mentioning Sable International on Jobabroad: courtesy heads-up|18-sable.txt"
)

print_list() {
  printf "%-4s  %-50s  %s\n" "N" "URL" "BODY"
  printf "%-4s  %-50s  %s\n" "---" "----------" "----"
  for row in "${RECIPIENTS[@]}"; do
    IFS='|' read -r n url subj body <<<"$row"
    printf "%-4s  %-50s  %s\n" "$n" "$url" "$body"
  done
}

if [[ $# -eq 0 || "${1:-}" == "list" || "${1:-}" == "--list" ]]; then
  print_list
  exit 0
fi

NUM="$1"
MATCH=""
for row in "${RECIPIENTS[@]}"; do
  IFS='|' read -r n url subj body <<<"$row"
  if [[ "$n" == "$NUM" ]]; then
    MATCH="$row"
    break
  fi
done

if [[ -z "$MATCH" ]]; then
  echo "ERROR: no recipient with number $NUM" >&2
  echo "Run \`$0 list\` to see all available numbers." >&2
  exit 1
fi

IFS='|' read -r N URL SUBJECT BODY_FILE <<<"$MATCH"
BODY_PATH="$BODIES_DIR/$BODY_FILE"

if [[ ! -f "$BODY_PATH" ]]; then
  echo "ERROR: body file missing: $BODY_PATH" >&2
  exit 1
fi

# Copy body to clipboard
wl-copy <"$BODY_PATH"

# Print metadata to terminal in a copy-friendly format
cat <<EOF
========================================
  Recipient #${N}
========================================

  Name:     ${NAME}
  Email:    ${EMAIL}
  Subject:  ${SUBJECT}

  Message:  (copied to clipboard, $(wc -c <"$BODY_PATH") bytes)
            Paste with Ctrl+V into the message field.

  Form:     ${URL}

----------------------------------------
Body preview (first 4 lines):
----------------------------------------
$(head -4 "$BODY_PATH" | sed 's/^/  /')
...

EOF

# Open the form in the default browser
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 &
  echo "Opening $URL in browser..."
else
  echo "(xdg-open not found; open the URL manually)"
fi

echo
echo "After submitting, log the send in docs/outreach-emails.md status log."
