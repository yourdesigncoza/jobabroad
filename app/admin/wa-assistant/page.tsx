import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth-guards';
import WaAssistantClient from './WaAssistantClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin · WA assistant',
  robots: { index: false, follow: false },
};

export default async function WaAssistantPage() {
  await requireAdmin('/admin/wa-assistant');
  return <WaAssistantClient />;
}
