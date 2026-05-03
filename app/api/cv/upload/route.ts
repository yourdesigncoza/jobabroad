import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const leadId = formData.get('leadId') as string;
  const token = formData.get('token') as string;

  if (!file || !leadId || !token) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: tokenRow } = await supabase
    .from('member_tokens')
    .select('lead_id')
    .eq('token', token)
    .single();

  if (!tokenRow || tokenRow.lead_id !== leadId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const storagePath = `${leadId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('cvs')
    .upload(storagePath, file);

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  await supabase
    .from('cv_submissions')
    .insert({ lead_id: leadId, type: 'upload', storage_path: storagePath });

  return NextResponse.json({ success: true });
}
