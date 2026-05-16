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
  if (!/^27\d{9}$/.test(normalised)) return normalised;
  const local = `0${normalised.slice(2)}`;
  return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
}

export const saPhoneSchema = z
  .string()
  .trim()
  .refine(isSaPhone, { message: 'Enter a valid SA phone (e.g. 061 711 4715)' })
  .transform(normaliseSaPhone);
