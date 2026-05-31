import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import { hasFullAccess } from '@/lib/access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_USER_ATTEMPTS = 5;
// /api/reports/download handles the auth + signing on click; using a stable
// URL here avoids stale-signature problems when the dashboard sits open past
// the 5-minute signed-URL TTL, and works even when the PDF object hasn't been
// uploaded yet (the download route returns 404 in that case).
const DOWNLOAD_PATH = '/api/reports/download';

export interface ReportStatusResponse {
  status: 'pending' | 'completed' | 'failed' | 'missing';
  pdfUrl: string | null;
  attempts: number;
  canRetry: boolean;
  error: string | null;
}

export async function GET() {
  const ssr = await createSupabaseServerClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data: profile } = await ssr
    .from('profiles')
    .select('tier')
    .eq('user_id', user.id)
    .single();
  if (!hasFullAccess(profile?.tier)) {
    return NextResponse.json({ error: 'paid_only' }, { status: 403 });
  }

  // Use the service client to read paid_reports — RLS allows the user to read
  // their own row, but using service-role bypasses any policy quirks and the
  // tier check above is the real ownership gate.
  const svc = createSupabaseServiceClient();
  const { data: report } = await svc
    .from('paid_reports')
    .select('pdf_path, generation_status, generation_attempts, generation_error')
    .eq('user_id', user.id)
    .maybeSingle();

  // No row yet means generation hasn't even started (webhook race). Treat as
  // pending from the client's perspective — same skeleton state.
  if (!report) {
    const body: ReportStatusResponse = {
      status: 'missing',
      pdfUrl: null,
      attempts: 0,
      canRetry: false,
      error: null,
    };
    return NextResponse.json(body);
  }

  const status = report.generation_status as 'pending' | 'completed' | 'failed';
  const attempts = (report.generation_attempts as number) ?? 0;
  const body: ReportStatusResponse = {
    status,
    pdfUrl: status === 'completed' && report.pdf_path ? DOWNLOAD_PATH : null,
    attempts,
    canRetry: status === 'failed' && attempts < MAX_USER_ATTEMPTS,
    error: status === 'failed' ? (report.generation_error as string | null) : null,
  };
  return NextResponse.json(body);
}
