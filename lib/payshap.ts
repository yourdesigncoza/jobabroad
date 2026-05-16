// Retained for lib/whatsapp-templates.ts (deprecated as of step 12 of the
// supabase-auth-migration plan; removed when the templates themselves are
// dropped). No user-facing UI imports this anymore.
export const PAYSHAP = {
  proxy: process.env.NEXT_PUBLIC_PAYSHAP_PROXY ?? '0791771970',
  name: process.env.NEXT_PUBLIC_PAYSHAP_NAME ?? 'J. M. Montgomery',
  amount: 'R199',
} as const;
