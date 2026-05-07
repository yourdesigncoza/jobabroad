export const PAYSHAP = {
  proxy: process.env.NEXT_PUBLIC_PAYSHAP_PROXY ?? '0791771970',
  name: process.env.NEXT_PUBLIC_PAYSHAP_NAME ?? 'J. M. Montgomery',
  amount: 'R199',
} as const;
