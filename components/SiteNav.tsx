import Link from 'next/link';
import TrackedLink from '@/components/TrackedLink';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function SiteNav({ src }: { src?: string }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedIn = Boolean(user?.email_confirmed_at);

  const linkClass = 'font-body text-sm font-semibold underline-offset-4 hover:underline';
  const primaryClass =
    'font-body text-sm font-semibold px-4 py-2 rounded-full border-2 transition-all';

  return (
    <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
      <Link href="/" className="flex items-center text-[1.5em] md:text-[2.2em]">
        <span className="font-body font-bold" style={{ color: '#2C2C2C' }}>job</span>
        <span className="font-body font-bold" style={{ color: '#ff751f' }}>abroad</span>
      </Link>

      <div className="flex items-center gap-3">
        {isSignedIn ? (
          <>
            <Link
              href="/dashboard"
              className={`${linkClass} hidden sm:inline`}
              style={{ color: '#1B4D3E' }}
            >
              Dashboard
            </Link>
            <form action="/logout" method="POST" className="hidden sm:inline-flex items-center">
              <button
                type="submit"
                className={`${linkClass} cursor-pointer`}
                style={{ color: '#6B6B6B' }}
              >
                Log out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className={`${linkClass} hidden sm:inline`} style={{ color: '#1B4D3E' }}>
              Log in
            </Link>
            <Link
              href="/register"
              className={primaryClass}
              style={{ backgroundColor: '#1B4D3E', borderColor: '#1B4D3E', color: '#F8F5F0' }}
            >
              Register free
            </Link>
          </>
        )}

        <TrackedLink
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'm interested in working abroad. Can you help me?")}`}
          event="cta_click"
          data={{ location: 'nav', source: src ?? 'direct' }}
          className={`${primaryClass} flex items-center gap-2`}
          style={{ borderColor: '#1B4D3E', color: '#1B4D3E' }}
        >
          <WhatsAppIcon size={15} />
          <span className="hidden sm:inline">WhatsApp</span>
        </TrackedLink>
      </div>
    </nav>
  );
}
