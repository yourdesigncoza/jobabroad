import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized, ADMIN_REALM } from '@/lib/admin-auth';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

export function middleware(req: NextRequest) {
  if (isAdminAuthorized(req)) {
    return NextResponse.next();
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${ADMIN_REALM}", charset="UTF-8"`,
    },
  });
}
