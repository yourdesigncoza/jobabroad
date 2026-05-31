import { requireAdmin } from '@/lib/auth-guards';
import AdminNav from '@/components/AdminNav';

/**
 * Wraps every /admin page with the shared admin header. Also guards the whole
 * segment: non-admins hit notFound() here before any admin chrome renders, so
 * the nav never shows to non-admins even though each page still guards itself.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin('/admin');
  // Fragment, not a min-h-screen wrapper: each admin page already owns a
  // min-h-screen background, and the nav's background matches, so they blend.
  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}
