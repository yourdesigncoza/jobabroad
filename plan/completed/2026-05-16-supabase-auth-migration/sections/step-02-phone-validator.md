---
step: 02
title: SA phone validator (lib/phone.ts)
status: done
depends-on: []
module: lib
---

# Step 02 — SA phone validator

## Objective

A single function that validates South African mobile/landline numbers and returns the normalised `27XXXXXXXXX` form, plus a typed Zod schema for re-use in server actions.

## Architecture context

- Memory `project_phone_number` says: display as `061-711-4715`, wa.me links use `27617114715`.
- Existing code in `app/admin/page.tsx:58` strips non-digits ad-hoc — that codepath is being deleted in Step 12, so don't refactor it.
- `zod@^4.4.3` is in deps.

## Files to create

### `lib/phone.ts`

```ts
import { z } from 'zod';

const SA_PHONE_RE = /^(?:\+?27|0)(\d{9})$/;

export function normaliseSaPhone(input: string): string {
  const cleaned = input.replace(/[\s\-()]/g, '');
  const m = cleaned.match(SA_PHONE_RE);
  if (!m) throw new Error('Invalid SA phone number');
  return `27${m[1]}`;
}

export function isSaPhone(input: string): boolean {
  try {
    normaliseSaPhone(input);
    return true;
  } catch {
    return false;
  }
}

export function formatSaPhoneDisplay(normalised: string): string {
  // 27617114715 -> 061-711-4715
  if (!/^27\d{9}$/.test(normalised)) return normalised;
  const local = `0${normalised.slice(2)}`;
  return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
}

export const saPhoneSchema = z
  .string()
  .trim()
  .refine(isSaPhone, { message: 'Enter a valid SA phone (e.g. 061 711 4715)' })
  .transform(normaliseSaPhone);
```

### `tests/phone.spec.ts` (or `lib/phone.test.ts` — use whichever testing layout the project already has; if none, skip the test file)

If no existing unit-test infra exists (only Playwright), inline a few assertions inside `tests/auth-flow.spec.ts` Step 14 instead. Do not introduce a new test framework here.

## Files to modify

None.

## Pattern context

- Accepts `0XXXXXXXXX`, `27XXXXXXXXX`, `+27XXXXXXXXX`, with arbitrary spaces/dashes/parens.
- Always normalises to `27XXXXXXXXX` (no `+`).
- The display formatter is a separate helper — never store the dashed form.

## Risk context

- `27` prefix collision: technically `27` is the SA country code; numbers like `27XXXXXXXXX` could also be misread as a local 11-digit number starting `27`. SA local mobile numbers always start `0`, so the regex `^(?:\+?27|0)(\d{9})$` is unambiguous: if it starts `0` we take the next 9; if it starts `+27`/`27` we take the next 9. Total length after stripping: exactly 10 (with `0`) or 11 (with `27`) or 12 (with `+27`).

## Gemini-noted considerations

- None specific. Phone uniqueness is enforced at the DB level in Step 03 (`UNIQUE` constraint on `profiles.phone`).

## Done when

- `lib/phone.ts` exists, exports `normaliseSaPhone`, `isSaPhone`, `formatSaPhoneDisplay`, `saPhoneSchema`.
- All these accept: `0617114715`, `27617114715`, `+27617114715`, `+27 61 711 4715`, `061-711-4715`.
- All these reject: `0617114`, `27617114715X`, `1234567890`, `+44 20 7946 0958`.
- `normaliseSaPhone('+27 61 711 4715')` returns `'27617114715'` exactly.
- `npm run lint` and `npm run build` pass.
