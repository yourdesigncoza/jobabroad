import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const AUTH_REQUIRED = [/^\/dashboard(\/|$)/, /^\/members\//];
const AUTH_FORBIDDEN_IF_SIGNED_IN = [
  /^\/login(\/|$)/,
  /^\/register(\/|$)/,
  /^\/forgot-password(\/|$)/,
];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRequired = AUTH_REQUIRED.some((re) => re.test(path));
  const isAuthForbidden = AUTH_FORBIDDEN_IF_SIGNED_IN.some((re) => re.test(path));

  if (isAuthRequired && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  if (isAuthRequired && user && !user.email_confirmed_at) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/confirm-email';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (isAuthForbidden && user && user.email_confirmed_at) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?)$).*)',
  ],
};
