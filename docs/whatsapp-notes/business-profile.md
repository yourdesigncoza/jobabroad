# WhatsApp Business — 061-711-4715 profile

Canonical copy for the WhatsApp Business profile on the dedicated 061-711-4715 SIM. Update here first, then sync into the app (Settings → Business profile / Business tools).

## Business profile

| Field | Value |
|---|---|
| **Business name** | Jobabroad |
| **Category** | Education *(closest preset match; "Recruiting Service" signals fees we don't charge)* |
| **Website** | https://jobabroad.co.za |
| **Email** | hello@jobabroad.co.za |
| **Address** | _skip — not a storefront_ |
| **Hours** | _set business hours or "Always open" — affects away-message scheduling_ |

## Email routing for hello@jobabroad.co.za

DNS for jobabroad.co.za is hosted on **Hetzner SA** (nameservers `dns-h.com` / `host-h.net`) with MX `mail.jobabroad.co.za` — mail hosting is already running on the Hetzner account.

**Inbound** (someone emails `hello@jobabroad.co.za`):
1. Hetzner Konsole H → `jobabroad.co.za` → Email → create `hello@jobabroad.co.za` mailbox
2. Add forwarding rule → `laudes.michael@gmail.com`
3. No new infrastructure, no extra cost (uses existing Hetzner mail package)

**Outbound** (replying as `hello@jobabroad.co.za`):
1. Brevo dashboard → Senders → add `hello@jobabroad.co.za` as a verified sender
2. Add Brevo's SPF / DKIM / DMARC records to Hetzner DNS for `jobabroad.co.za`
3. `lib/email/brevo.ts` can then send from this address — same pattern as other senders

**Rule of thumb:** Brevo is sender-only; never try to receive mail through it. Cloudflare Email Routing is the receiver. They never overlap.

### Gmail "Send mail as" — configured 2026-05-18

Replies in Gmail (from `laudes.michael@gmail.com`) now go out **as** `hello@jobabroad.co.za` via Brevo's SMTP relay (`smtp-relay.brevo.com:587`). Authenticated with a dedicated Brevo SMTP key (`gmail-sendmailas-jobabroad`) — separate from the Supabase key so either can be rotated independently.

**Gotcha worth remembering:** Gmail's "Send mail as" wizard auto-detects `route1.mx.cloudflare.net` as the SMTP server (because Cloudflare's MX records are now in DNS). That's wrong — Cloudflare Email Routing is **inbound only** and won't relay outbound. Always override the auto-detected SMTP server with `smtp-relay.brevo.com`.



## About (description)

256-char limit. Current copy uses 247.

```
Real pathways to overseas work for South Africans.
No scams, no guesswork.

Free pathway guides for 11 categories — teaching, nursing, hospitality, trades, farm work and more.

Get started: jobabroad.co.za
```

## Away message

Settings → Business tools → Away message. Useful even before any automation — sets expectation + points to the site for self-serve.

```
Thanks for messaging Jobabroad! We'll reply within a few hours.

In the meantime, browse free pathway guides for 11 work-abroad categories at jobabroad.co.za — register on the one that fits and the full guide opens up.
```

## Greeting message

Settings → Business tools → Greeting message. Sent automatically when a contact messages for the first time, or after 14 days of inactivity.

```
Hi! Thanks for reaching out to Jobabroad.

To help you fastest: what kind of work are you looking for overseas? (e.g. teaching, hospitality, nursing, farm work, trades, au pair, TEFL, accounting, IT, engineering, seasonal)
```

## Quick replies

**Important distinction:**
- **`qa-library.md` patterns** = full category-specific templates we type/paste manually after reading the question. Conversation-aware, long, qualifying.
- **WhatsApp Business Quick Replies (this section)** = ultra-short, generic, one-tap snippets for routine moments (acknowledge, ask category, point to site, etc.). Reusable across many conversations regardless of category.

Add via Settings → Business tools → Quick replies. Each shortcut is just the word — WA prefixes `/` automatically.

| Shortcut | Use when | Text |
|---|---|---|
| `thanks` | acknowledge any inbound, will reply later | Thanks for messaging Jobabroad! We'll get back to you shortly with the right pathway for you. |
| `cat` | need to qualify which category they're after | Which category are you interested in? (teaching, hospitality, nursing, farm work, trades, au pair, TEFL, accounting, IT, engineering, seasonal) |
| `site` | redirect them to the homepage / get them to register | All the free pathway guides are on https://jobabroad.co.za — pick the category that fits and register, the full guide opens up. |
| `passport` | quick passport qualifier in any thread | Quick one — do you have a valid passport? It's the first must-have for any overseas role. |
| `busy` | can't reply substantively right now | Thanks for your message! We'll come back to you within a few hours — we're on a call right now. |

Don't pollute this list with category-specific replies — those belong in `qa-library.md` and stay paste-from-doc, not one-tap, because they need light per-contact edits.

## Rules (mirrors `README.md`)

1. **No specifics** in any auto-reply or quick-reply: never name recruiters, employers, salary ranges, visa fees, or country-specific requirements.
2. **Always steer to the matching category** at `jobabroad.co.za/register?category=<slug>`.
3. **Never mention R495 upfront** — paid tier surfaces post-registration only.
4. **One follow-up question** per reply.
5. **Anonymous voice** — always "we", never "John".
