import 'server-only';
import { generateReport } from './generator';
import { sendReportReadyEmail } from '@/lib/notifications/report-ready-email';

/**
 * Generate the buyer's personalised PDF then email it to them. Used as the
 * waitUntil() target everywhere we kick off a (re)generation:
 *
 *   - app/api/payments/webhook/route.ts   (initial post-payment)
 *   - app/members/[category]/paid/page.tsx (fallback when webhook missed)
 *   - app/api/reports/regenerate/route.ts  (user-facing retry, capped)
 *   - app/api/admin/users/regenerate/route.ts (admin force-regen, uncapped)
 *
 * Errors are caught here and logged. generateReport already writes
 * generation_status='failed' to paid_reports on caught throws, so callers
 * don't need to do bookkeeping — the dashboard's ReportStatusCard surfaces
 * the failed state and offers a retry without any extra plumbing.
 */
export async function generateAndEmail(userId: string): Promise<void> {
  try {
    const { pdfBuffer, userName, categoryLabel } = await generateReport(userId);
    await sendReportReadyEmail(userId, pdfBuffer, userName, categoryLabel);
  } catch (err) {
    console.error('[generate-and-email] failed', { userId, err });
  }
}
