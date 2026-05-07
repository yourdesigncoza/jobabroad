function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function isAdminAuthorized(req: Request): boolean {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return false;

  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Basic ')) return false;

  let decoded: string;
  try {
    decoded = atob(auth.slice(6));
  } catch {
    return false;
  }

  const password = decoded.includes(':')
    ? decoded.split(':').slice(1).join(':')
    : decoded;

  return timingSafeEqual(password, expected);
}

export const ADMIN_REALM = 'Jobabroad Admin';
