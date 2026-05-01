import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { secret, phone, category } = await req.json();

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .upsert({ phone, interest_category: category }, { onConflict: 'phone' })
    .select()
    .single();

  if (leadError) {
    return NextResponse.json({ error: leadError.message }, { status: 500 });
  }

  const { data: tokenRow, error: tokenError } = await supabase
    .from('member_tokens')
    .insert({ lead_id: lead.id, interest_category: category })
    .select()
    .single();

  if (tokenError) {
    return NextResponse.json({ error: tokenError.message }, { status: 500 });
  }

  return NextResponse.json({
    memberLink: `${process.env.NEXT_PUBLIC_BASE_URL}/members/${tokenRow.token}`,
  });
}
