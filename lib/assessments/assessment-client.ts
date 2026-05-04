import { createClient } from '@supabase/supabase-js';

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface AssessmentRow {
  id: string;
  member_token_id: string;
  category: string;
  schema_version: number;
  completed_step_slugs: string[];
  status: 'draft' | 'submitted';
  data: Record<string, { q: string; v: unknown }>;
  submitted_at: string | null;
  updated_at: string;
}

export async function getLatestAssessment(memberTokenId: string): Promise<AssessmentRow | null> {
  const { data } = await getClient()
    .from('assessments')
    .select('*')
    .eq('member_token_id', memberTokenId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  return data ?? null;
}

export async function saveAssessmentStep(params: {
  assessmentId: string | null;
  memberTokenId: string;
  category: string;
  schemaVersion: number;
  stepSlug: string;
  stepData: Record<string, { q: string; v: unknown }>;
  existingData: Record<string, { q: string; v: unknown }>;
  existingSlugs: string[];
}): Promise<string> {
  const supabase = getClient();
  const merged = { ...params.existingData, ...params.stepData };
  const slugs = Array.from(new Set([...params.existingSlugs, params.stepSlug]));

  if (params.assessmentId) {
    await supabase
      .from('assessments')
      .update({ data: merged, completed_step_slugs: slugs, updated_at: new Date().toISOString() })
      .eq('id', params.assessmentId);
    return params.assessmentId;
  }

  const { data } = await supabase
    .from('assessments')
    .insert({
      member_token_id: params.memberTokenId,
      category: params.category,
      schema_version: params.schemaVersion,
      completed_step_slugs: slugs,
      data: merged,
    })
    .select('id')
    .single();
  return data!.id;
}

export async function submitAssessment(assessmentId: string): Promise<void> {
  await getClient()
    .from('assessments')
    .update({ status: 'submitted', submitted_at: new Date().toISOString() })
    .eq('id', assessmentId);
}
