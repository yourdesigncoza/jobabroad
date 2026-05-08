#!/usr/bin/env python3
"""Extract recruiters/placement agencies from wiki-builds vaults into outreach tables."""
import re, sys, json
from pathlib import Path

ROOT = Path("/home/laudes/zoot/projects/wiki-builds/work-abroad-web")
OUT = Path("/home/laudes/zoot/projects/work-abroad-web/docs/outreach-contacts.md")
TS_OUT = Path("/home/laudes/zoot/projects/work-abroad-web/lib/outreach-data.ts")

URL_RE = re.compile(r"https?://[^\s\)\]\"<>]+")
EMAIL_RE = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_RE = re.compile(r"(?:Tel(?:ephone)?|Phone|Call)[:\s]+([+()\d\s\-]{7,})", re.I)

# What counts as a recruiter / placement agency we'd email
KEEP_HINTS = [
    "recruiter", "recruitment", "placement", "agency", "agencies", "consultant",
    "consultancy", "migration_consultant", "migration consultant", "visa consultant",
    "manpower", "staffing", "labour-hire", "employment-agency",
]
# Things to exclude even if type: organisation
EXCLUDE_TAG_HINTS = [
    "embassy", "high-commission", "high_commission", "consulate", "government",
    "regulator", "regulatory", "sponsor", "scheme_operator", "issuing_body",
    "hotel", "hotel_group", "trade-union", "ngo", "professional-body",
]

def parse_frontmatter(text):
    if not text.startswith("---"):
        return {}, text
    end = text.find("\n---", 3)
    if end < 0:
        return {}, text
    fm_block = text[3:end].strip("\n")
    body = text[end+4:].lstrip("\n")
    fm = {}
    cur_key = None
    cur_list = None
    for line in fm_block.split("\n"):
        if not line.strip():
            continue
        if cur_list is not None and (line.startswith("  -") or line.startswith("  - ") or line.startswith("- ")):
            val = line.split("-", 1)[1].strip().strip('"').strip("'")
            cur_list.append(val)
            continue
        else:
            cur_list = None
        m = re.match(r"^([a-zA-Z_][\w-]*):\s*(.*)$", line)
        if not m:
            continue
        k, v = m.group(1), m.group(2)
        v = v.strip()
        if v == "":
            cur_list = []
            fm[k] = cur_list
            cur_key = k
        elif v.startswith("[") and v.endswith("]"):
            inner = v[1:-1].strip()
            items = [x.strip().strip('"').strip("'") for x in inner.split(",") if x.strip()]
            fm[k] = items
        else:
            fm[k] = v.strip('"').strip("'")
            cur_key = k
    return fm, body

def first_or(val, default=""):
    if val is None: return default
    if isinstance(val, list):
        return val[0] if val else default
    return val

def extract_contacts(body):
    urls = URL_RE.findall(body)
    emails = EMAIL_RE.findall(body)
    phones = PHONE_RE.findall(body)
    return urls, emails, phones

NAME_BLOCKLIST = {
    # User-removed (May 2026): redirect / Lorem ipsum testimonials / spammy
    "swa nursing recruitment",
    "pulse staffing",
    "thymic recruitment",
}

def is_recruiter(fm, body, path):
    # Hard exclusions: meta/absence notes, unverified entries, user blocklist
    name_lower = str(fm.get("name") or fm.get("trading_name") or fm.get("legal_name") or "").lower()
    if name_lower in NAME_BLOCKLIST:
        return False
    if "absence note" in name_lower or name_lower.startswith("no "):
        return False
    if str(fm.get("evidence_strength","")).lower() == "rumoured":
        return False
    # keep "alleged" entries but they'll be flagged in the Evidence column for user to verify before emailing
    blob = " ".join([
        str(fm.get("entity_type", "")),
        str(fm.get("type_of_body", "")),
        " ".join(fm.get("tags", []) if isinstance(fm.get("tags"), list) else [str(fm.get("tags", ""))]),
        str(fm.get("scope", "")),
        str(fm.get("summary", "")),
        path.parent.name,
        path.name,
    ]).lower()
    if any(h in blob for h in EXCLUDE_TAG_HINTS):
        if any(h in blob for h in KEEP_HINTS) and not any(x in blob for x in ["embassy","high-commission","high_commission","consulate","hotel","government_body","regulatory_body","sponsor_agency","scheme_operator"]):
            return True
        return False
    if any(h in blob for h in KEEP_HINTS):
        return True
    if "Organisations" in path.parts and "06-contacts" in path.parts[len(ROOT.parts):][0]:
        if any(h in blob for h in ["embassy","high-commission","consulate","government","regulator"]):
            return False
        return True
    return False

# ----- gather organisation files -----
files = []
for p in ROOT.rglob("*.md"):
    if "/wiki/" not in str(p): continue
    text = p.read_text(errors="ignore")
    if not text.startswith("---"): continue
    if not re.search(r"^type:\s*organisation", text, re.M): continue
    files.append(p)

DESTINATION_PRETTY = {
    "uk": "United Kingdom", "uae": "UAE", "usa": "United States", "us": "United States",
    "australia": "Australia", "new_zealand": "New Zealand", "canada": "Canada",
    "ireland": "Ireland", "germany": "Germany", "south_africa": "South Africa",
    "saudi_arabia": "Saudi Arabia", "qatar": "Qatar", "spain": "Spain",
}

def pretty_destination(d):
    s = str(d).strip().strip('"').strip("'").lower()
    return DESTINATION_PRETTY.get(s, str(d).strip().strip('"').strip("'").replace("_", " ").title())

SCOPE_PRETTY = {
    "competence_card_issuer": "Competence card issuer",
    "migration_consultancy": "Migration consultancy",
    "document_concierge": "Document concierge",
    "skills_assessment": "Skills assessment",
    "regulator": "Regulator",
    "trade_union_jib": "Trade union (JIB)",
    "professional_body": "Professional body",
    "recruiter": "Recruiter",
    "agency": "Recruitment agency",
}

def pretty_scope(v):
    if not v: return ""
    s = str(v).strip().strip('"').strip("'").lower()
    return SCOPE_PRETTY.get(s, s.replace("_", " ").capitalize())

def first_body_paragraph(body, max_chars=380):
    """Return the first prose paragraph from a wiki note body.

    Skips the leading H1, frontmatter callouts, and blockquotes; strips wiki-link
    brackets and inline emphasis; truncates at the nearest sentence boundary
    under max_chars.
    """
    if not body: return ""
    lines = body.split("\n")
    paragraph_lines = []
    capturing = False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if capturing:
                break
            continue
        if stripped.startswith("#"): continue          # headings
        if stripped.startswith(">"): continue          # blockquotes/callouts
        if stripped.startswith("**"): pass             # allow lead with bold
        if stripped.startswith("- ") or stripped.startswith("* "): continue
        if stripped.startswith("|"): continue           # tables
        capturing = True
        paragraph_lines.append(stripped)
    para = " ".join(paragraph_lines).strip()
    if not para: return ""
    # strip wiki [[link|text]] -> text, [[link]] -> link
    para = re.sub(r"\[\[([^\|\]]+)\|([^\]]+)\]\]", r"\2", para)
    para = re.sub(r"\[\[([^\]]+)\]\]", r"\1", para)
    # strip simple markdown emphasis
    para = re.sub(r"\*\*([^*]+)\*\*", r"\1", para)
    para = re.sub(r"\*([^*]+)\*", r"\1", para)
    para = re.sub(r"\s+", " ", para).strip()
    if len(para) <= max_chars:
        return para
    # truncate at last sentence boundary under max_chars
    cut = para[:max_chars]
    last = max(cut.rfind(". "), cut.rfind("? "), cut.rfind("! "))
    if last > max_chars * 0.5:
        return cut[:last + 1].strip()
    return cut.rstrip() + "…"

def synthesize_summary(fm):
    """Build a short summary when frontmatter doesn't include one."""
    parts = []
    legal = fm.get("legal_name") or ""
    if isinstance(legal, list): legal = legal[0] if legal else ""
    legal = str(legal).strip()
    juris = str(fm.get("jurisdiction_detail") or "").strip()
    scopes = fm.get("scope")
    if isinstance(scopes, list):
        scope_pretty = ", ".join(pretty_scope(s) for s in scopes if s)
    else:
        scope_pretty = pretty_scope(scopes or "")
    apl_trades = fm.get("applicable_trades")
    trades_pretty = ""
    if isinstance(apl_trades, list) and apl_trades:
        if "all_trades" in [str(x).lower().strip() for x in apl_trades]:
            trades_pretty = "all trades"
        else:
            trades_pretty = ", ".join(str(t).replace("_", " ") for t in apl_trades[:6])
    reg_status = str(fm.get("registration_status") or "").strip()

    if legal and legal.lower() != str(fm.get("trading_name","")).lower():
        parts.append(f"{legal}.")
    if scope_pretty:
        parts.append(f"{scope_pretty}.")
    if juris:
        parts.append(juris.rstrip(".") + ".")
    if trades_pretty:
        parts.append(f"Applicable to {trades_pretty}.")
    if reg_status:
        parts.append(reg_status.rstrip(".") + ".")
    return " ".join(parts).strip()

recruiters = []
excluded = []
for p in sorted(files):
    text = p.read_text(errors="ignore")
    fm, body = parse_frontmatter(text)
    keep = is_recruiter(fm, body, p)
    name = fm.get("trading_name") or fm.get("legal_name") or fm.get("name") or p.stem
    if isinstance(name, list): name = name[0]
    contact_url = (
        fm.get("contact_url")
        or fm.get("official_url")
        or fm.get("primary_source_url")
        or fm.get("website")
        or ""
    )
    contact_method = fm.get("contact_method") or ""
    urls, emails, phones = extract_contacts(body)
    # also probe contact_method string
    cm_emails = EMAIL_RE.findall(str(contact_method))
    cm_phones = PHONE_RE.findall(str(contact_method)) or re.findall(r"\+?\d[\d\s\-()]{6,}", str(contact_method))
    cm_urls = URL_RE.findall(str(contact_method))

    direct_email = str(fm.get("email") or "").strip()
    direct_phone = str(fm.get("phone") or "").strip()

    all_emails = list(dict.fromkeys(([direct_email] if direct_email else []) + cm_emails + emails))
    all_phones = list(dict.fromkeys([s.strip() for s in (([direct_phone] if direct_phone else []) + cm_phones + phones) if s.strip()]))
    all_urls = list(dict.fromkeys([contact_url] + cm_urls + urls)) if contact_url else list(dict.fromkeys(cm_urls + urls))
    all_urls = [u for u in all_urls if u]

    dests_raw = (
        fm.get("destinations_covered")
        or fm.get("applicable_destinations")
        or fm.get("country")
        or ""
    )
    if isinstance(dests_raw, list):
        destinations = ", ".join(pretty_destination(d) for d in dests_raw if d)
    else:
        destinations = pretty_destination(dests_raw) if dests_raw else ""

    entity_type = fm.get("entity_type") or fm.get("type_of_body")
    if not entity_type:
        scope = fm.get("scope")
        if isinstance(scope, list) and scope:
            entity_type = pretty_scope(scope[0])
        elif scope:
            entity_type = pretty_scope(scope)
    entity_type = entity_type or ""

    summary = fm.get("summary") or first_body_paragraph(body) or synthesize_summary(fm)

    rec = {
        "name": name,
        "vault": p.parent.parent.name if p.parent.name in ("Organisations","Destination Regulators") else p.parent.name,
        "vault_root": str(p.relative_to(ROOT)).split("/")[0],
        "category": str(p.relative_to(ROOT)).split("/")[0].replace("wa-","").split("-06-")[0].replace("shared-","shared:"),
        "destinations": destinations,
        "entity_type": entity_type,
        "summary": summary,
        "url": all_urls[0] if all_urls else "",
        "all_urls": all_urls,
        "emails": all_emails,
        "phones": all_phones,
        "physical_address": str(fm.get("physical_address") or "").strip(),
        "contact_method_raw": contact_method,
        "evidence_strength": fm.get("evidence_strength") or "",
        "path": str(p.relative_to(ROOT)),
    }
    if keep:
        recruiters.append(rec)
    else:
        excluded.append(rec)

# Deduplicate by lowercased name
dedup = {}
for r in recruiters:
    key = re.sub(r"\s+"," ", str(r["name"]).strip().lower())
    if key not in dedup:
        dedup[key] = r
    else:
        # merge urls/emails/phones
        cur = dedup[key]
        for fld in ("all_urls","emails","phones"):
            cur[fld] = list(dict.fromkeys((cur[fld] or []) + (r[fld] or [])))
        if not cur["url"] and r["url"]:
            cur["url"] = r["url"]
        cur["category"] = cur["category"] + ", " + r["category"] if r["category"] not in cur["category"] else cur["category"]

recruiters = sorted(dedup.values(), key=lambda x: str(x["name"]).lower())

# ----- gather scams: named scam organisations only -----
# scam_pattern files are mostly archetypes; we want the few that name real entities.
# Strategy: scan all 05-scams notes, extract "Reported Instances" sections and pull named brands.
# Also look for type: scam_actor_type with a specific named target.
scam_rows = []
for p in ROOT.rglob("*.md"):
    if "/wiki/" not in str(p): continue
    if "05-scams" not in str(p) and "shared-scams" not in str(p): continue
    text = p.read_text(errors="ignore")
    if not text.startswith("---"): continue
    fm, body = parse_frontmatter(text)
    t = fm.get("type","")
    if t not in ("scam_pattern","scam_actor_type","organisation"): continue
    name = fm.get("name") or fm.get("legal_name") or fm.get("trading_name") or p.stem
    if isinstance(name, list): name = name[0]
    summary = fm.get("summary","")
    cat = fm.get("category","")
    target = fm.get("target_destination", fm.get("destinations_covered",""))
    channels = fm.get("channels","")
    fee = fm.get("typical_fee_requested_zar","")
    report_sa = fm.get("reporting_channel_sa","")
    report_dest = fm.get("reporting_channel_destination","")
    evidence = fm.get("evidence_strength","")
    scam_rows.append({
        "name": name,
        "category": cat,
        "kind": t,
        "destinations": target,
        "channels": channels,
        "typical_fee_zar": fee,
        "report_sa": report_sa,
        "report_destination": report_dest,
        "evidence": evidence,
        "summary": summary,
        "vault": str(p.relative_to(ROOT)).split("/")[0],
        "path": str(p.relative_to(ROOT)),
    })

scam_rows.sort(key=lambda x: (str(x["vault"]), str(x["name"]).lower()))

# ----- write markdown -----
def md_table(rows, columns):
    if not rows: return "_(none)_\n"
    head = "| " + " | ".join(c[1] for c in columns) + " |\n"
    sep = "|" + "|".join("---" for _ in columns) + "|\n"
    body_lines = []
    for r in rows:
        cells = []
        for key,_ in columns:
            v = r.get(key, "")
            if isinstance(v, list): v = ", ".join(str(x) for x in v if x)
            v = str(v).replace("|","\\|").replace("\n"," ")
            cells.append(v if v else "—")
        body_lines.append("| " + " | ".join(cells) + " |")
    return head + sep + "\n".join(body_lines) + "\n"

OUT.parent.mkdir(parents=True, exist_ok=True)
with OUT.open("w") as f:
    f.write("# Wiki Outreach Contacts\n\n")
    f.write("Generated from `wiki-builds/work-abroad-web/wa-*/wiki/` vaults. Recruiters and placement agencies only — embassies, regulators, government bodies, hotels, sponsors, and scheme operators are excluded.\n\n")
    f.write(f"**Sources scanned:** {len(files)} `type: organisation` notes across 5 category vaults + shared migration-cos vault.\n\n")
    f.write(f"**Recruiters/agencies kept:** {len(recruiters)}\n\n")
    f.write(f"**Excluded (embassies/regulators/etc):** {len(excluded)}\n\n")
    f.write("---\n\n## Good Standing — Recruiters & Placement Agencies\n\n")
    cols = [
        ("name","Company"),
        ("category","Category"),
        ("destinations","Destinations"),
        ("entity_type","Type"),
        ("url","Website"),
        ("emails","Email"),
        ("phones","Phone"),
        ("evidence_strength","Evidence"),
        ("summary","Notes"),
    ]
    f.write(md_table(recruiters, cols))
    f.write("\n\n---\n\n## Scams — Patterns and Reporting Channels\n\n")
    f.write("These are mostly **scam archetypes**, not named companies — the wikis warn about *kinds* of fraud (fake recruiters, bogus colleges, upfront-fee scams). Use the reporting channels in the last two columns to file a complaint if you encounter the pattern in the wild.\n\n")
    scam_cols = [
        ("name","Pattern / Actor"),
        ("category","Category"),
        ("vault","Vault"),
        ("destinations","Targets"),
        ("channels","Channels"),
        ("typical_fee_zar","Typical fee (ZAR)"),
        ("report_sa","Report (SA)"),
        ("report_destination","Report (destination)"),
        ("evidence","Evidence"),
    ]
    f.write(md_table(scam_rows, scam_cols))

    f.write("\n\n---\n\n## Excluded organisations (for reference)\n\n")
    f.write("These were skipped because they are embassies, regulators, government bodies, hotels, sponsor agencies, or scheme operators — not recruiters/placement agencies.\n\n")
    ex_cols = [
        ("name","Name"),
        ("vault_root","Vault"),
        ("entity_type","Type"),
        ("url","URL"),
        ("summary","Why listed in wiki"),
    ]
    # dedup excluded by name
    ex_dedup = {}
    for e in excluded:
        k = str(e["name"]).strip().lower()
        if k not in ex_dedup: ex_dedup[k] = e
    f.write(md_table(sorted(ex_dedup.values(), key=lambda x: str(x["name"]).lower()), ex_cols))

# ----- write TS data file for the public pages -----
def prettify_type(v):
    if not v: return ""
    s = str(v).replace("_", " ").strip()
    if not s: return ""
    return s[0].upper() + s[1:]

def to_list(v):
    if v is None: return []
    if isinstance(v, list): return [str(x).strip() for x in v if str(x).strip()]
    s = str(v).strip()
    if not s: return []
    if "," in s: return [x.strip() for x in s.split(",") if x.strip()]
    return [s]

CATEGORY_LABEL = {
    "nursing": "Healthcare",
    "teaching": "Teaching",
    "trades": "Trades",
    "hospitality": "Hospitality",
    "farming": "Farming",
    "seasonal": "Seasonal",
    "shared:migration-cos": "Migration consultants",
    "shared": "General",
}

def category_label(raw):
    # raw can be "nursing", "shared:migration-cos", or "nursing, shared:migration-cos"
    parts = [p.strip() for p in str(raw).split(",") if p.strip()]
    labels = []
    for p in parts:
        labels.append(CATEGORY_LABEL.get(p, p.replace("_"," ").title()))
    # dedup keeping order
    out = []
    for l in labels:
        if l not in out: out.append(l)
    return out

def js_str(s):
    if s is None: return '""'
    s = str(s).replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").strip()
    return f'"{s}"'

def js_arr(items):
    return "[" + ", ".join(js_str(x) for x in items) + "]"

ts_lines = []
ts_lines.append("// AUTO-GENERATED from wiki-builds vaults via /tmp/extract_contacts.py — do not edit by hand.")
ts_lines.append("// Re-run the extractor when the wiki vaults change.")
ts_lines.append("")
ts_lines.append("export type Recruiter = {")
ts_lines.append("  name: string;")
ts_lines.append("  categories: string[];")
ts_lines.append("  type: string;")
ts_lines.append("  destinations: string[];")
ts_lines.append("  website: string;")
ts_lines.append("  email: string;")
ts_lines.append("  phone: string;")
ts_lines.append("  evidence: 'confirmed' | 'high' | 'alleged' | '';")
ts_lines.append("  notes: string;")
ts_lines.append("};")
ts_lines.append("")
ts_lines.append("export type ScamPattern = {")
ts_lines.append("  name: string;")
ts_lines.append("  category: string;")
ts_lines.append("  vault: string;")
ts_lines.append("  destinations: string[];")
ts_lines.append("  channels: string[];")
ts_lines.append("  typicalFeeZar: string;")
ts_lines.append("  reportSa: string;")
ts_lines.append("  reportDestination: string;")
ts_lines.append("  evidence: string;")
ts_lines.append("  summary: string;")
ts_lines.append("};")
ts_lines.append("")
ts_lines.append("export const recruiters: Recruiter[] = [")
for r in recruiters:
    cats = category_label(r["category"])
    type_pretty = prettify_type(r.get("entity_type",""))
    if not type_pretty:
        # infer from categories — single-cat rows that are "Migration consultants" etc.
        type_pretty = cats[0] if cats else ""
    dests = to_list(r.get("destinations",""))
    ts_lines.append("  {")
    ts_lines.append(f"    name: {js_str(r['name'])},")
    ts_lines.append(f"    categories: {js_arr(cats)},")
    ts_lines.append(f"    type: {js_str(type_pretty)},")
    ts_lines.append(f"    destinations: {js_arr(dests)},")
    ts_lines.append(f"    website: {js_str(r.get('url',''))},")
    ts_lines.append(f"    email: {js_str(r['emails'][0] if r.get('emails') else '')},")
    ts_lines.append(f"    phone: {js_str(r['phones'][0] if r.get('phones') else '')},")
    ts_lines.append(f"    evidence: {js_str(r.get('evidence_strength',''))} as Recruiter['evidence'],")
    ts_lines.append(f"    notes: {js_str(r.get('summary',''))},")
    ts_lines.append("  },")
ts_lines.append("];")
ts_lines.append("")

# infer scam category label from vault: wa-nursing-05-scams -> Healthcare
def scam_category_label(vault):
    raw = vault.replace("wa-","").replace("-05-scams","").replace("shared-scams","general")
    return CATEGORY_LABEL.get(raw, raw.replace("-"," ").title())

ts_lines.append("export const scamPatterns: ScamPattern[] = [")
for s in scam_rows:
    label = scam_category_label(s["vault"])
    cats_pretty = ", ".join(prettify_type(x) for x in to_list(s.get("category",""))) or label
    dests = to_list(s.get("destinations",""))
    channels = to_list(s.get("channels",""))
    ts_lines.append("  {")
    ts_lines.append(f"    name: {js_str(s['name'])},")
    ts_lines.append(f"    category: {js_str(label)},")
    ts_lines.append(f"    vault: {js_str(cats_pretty)},")
    ts_lines.append(f"    destinations: {js_arr(dests)},")
    ts_lines.append(f"    channels: {js_arr(channels)},")
    ts_lines.append(f"    typicalFeeZar: {js_str(s.get('typical_fee_zar',''))},")
    ts_lines.append(f"    reportSa: {js_str(s.get('report_sa',''))},")
    ts_lines.append(f"    reportDestination: {js_str(s.get('report_destination',''))},")
    ts_lines.append(f"    evidence: {js_str(s.get('evidence',''))},")
    ts_lines.append(f"    summary: {js_str(s.get('summary',''))},")
    ts_lines.append("  },")
ts_lines.append("];")
ts_lines.append("")

TS_OUT.parent.mkdir(parents=True, exist_ok=True)
TS_OUT.write_text("\n".join(ts_lines))

print(f"Wrote {OUT}")
print(f"Wrote {TS_OUT}")
print(f"Recruiters: {len(recruiters)}  Excluded: {len(excluded)}  Scam rows: {len(scam_rows)}")
print()
print("=== Recruiter names ===")
for r in recruiters:
    print(f"  - {r['name']:<55}  {r['category']:<25}  url={r['url'][:60]}")
print()
print("=== Excluded names (sanity check) ===")
seen=set()
for r in excluded:
    n = str(r['name']).strip().lower()
    if n in seen: continue
    seen.add(n)
    print(f"  - {r['name']:<55}  {r['entity_type'] or r.get('vault_root','')}")
