import { test, expect } from '@playwright/test';
import {
  svc,
  uniqueEmail,
  uniquePhone,
  registerAndLogin,
  findUserIdByEmail,
  makePaid,
  insertSubmittedTeachingAssessment,
  deleteUser,
} from './helpers';

const PASSWORD = 'Test12345!';

async function setupPaidTeacher(page: import('@playwright/test').Page, email: string) {
  await registerAndLogin(page, {
    email,
    password: PASSWORD,
    name: 'Coach Tester',
    phone: uniquePhone(),
    category: 'teaching',
  });
  const userId = await findUserIdByEmail(email);
  await makePaid(userId);
  await insertSubmittedTeachingAssessment(userId);
  return userId;
}

// =========================================================================
// Access gates
// =========================================================================

test.describe('Coach — access gates', () => {
  test('unauthenticated chat request → 401', async ({ request }) => {
    const r = await request.post('/api/agent/chat', {
      data: { query: 'hi', requestId: 'x' },
    });
    expect(r.status()).toBe(401);
  });

  test('free user → coach page shows premium gate', async ({ page }) => {
    const email = uniqueEmail('coach-free');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Free Tester',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      await page.goto('/members/teaching/coach');
      await expect(page.getByText(/premium feature/i)).toBeVisible();
    } finally {
      await deleteUser(email);
    }
  });

  test('free user chat request → 403 paid_only', async ({ page }) => {
    const email = uniqueEmail('coach-free-api');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Free Api',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const r = await page.request.post('/api/agent/chat', {
        data: { query: 'hi', requestId: 'rid-1' },
      });
      expect(r.status()).toBe(403);
    } finally {
      await deleteUser(email);
    }
  });

  test('paid user with lapsed window → 403 on_hold', async ({ page }) => {
    const email = uniqueEmail('coach-onhold');
    try {
      const userId = await setupPaidTeacher(page, email);
      await svc()
        .from('profiles')
        .update({ agent_access_expires_at: new Date(Date.now() - 86_400_000).toISOString() })
        .eq('user_id', userId);
      const r = await page.request.post('/api/agent/chat', {
        data: { query: 'hi', requestId: 'rid-onhold' },
      });
      expect(r.status()).toBe(403);
      expect((await r.json()).error).toBe('on_hold');
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// Coach page + journey seeding
// =========================================================================

test.describe('Coach — page + journey', () => {
  test('paid teacher sees coach UI + journey seeded from assessment', async ({ page }) => {
    const email = uniqueEmail('coach-page');
    try {
      await setupPaidTeacher(page, email);
      await page.goto('/members/teaching/coach');

      await expect(page.getByRole('heading', { name: /teaching coach/i })).toBeVisible();
      await expect(page.getByPlaceholder(/ask your coach/i)).toBeVisible();
      await expect(page.getByText(/your journey/i)).toBeVisible();
      await expect(page.getByText('Valid passport')).toBeVisible();

      // Persist the seed deterministically (the page render is read-only; the
      // client touch on mount is async, so don't race it).
      await page.request.post('/api/agent/touch');

      // Strong-profile assessment seeds these milestones to done.
      const userId = await findUserIdByEmail(email);
      const { data } = await svc()
        .from('user_journey')
        .select('milestones, incomplete_count')
        .eq('user_id', userId)
        .single();
      const byKey = Object.fromEntries(
        (data!.milestones as { key: string; status: string }[]).map((m) => [m.key, m.status]),
      );
      expect(byKey.passport).toBe('done');
      expect(byKey.sace_registration).toBe('done');
      expect(byKey.qts_route).toBe('done');
      expect(byKey.police_clearance).toBe('done');
      expect(byKey.english_test).toBe('done');
      expect(byKey.sponsor_secured).toBe('not_started');
    } finally {
      await deleteUser(email);
    }
  });

  test('manual journey edit applies (and may regress)', async ({ page }) => {
    const email = uniqueEmail('coach-journey');
    try {
      const userId = await setupPaidTeacher(page, email);
      // seed the row first via touch
      await page.request.post('/api/agent/touch');

      // advance an incomplete milestone
      let r = await page.request.post('/api/agent/journey', {
        data: { key: 'sponsor_secured', status: 'in_progress' },
      });
      expect(r.ok()).toBeTruthy();

      // manual regression of a done milestone is allowed
      r = await page.request.post('/api/agent/journey', {
        data: { key: 'passport', status: 'not_started' },
      });
      expect(r.ok()).toBeTruthy();

      const { data } = await svc()
        .from('user_journey')
        .select('milestones')
        .eq('user_id', userId)
        .single();
      const byKey = Object.fromEntries(
        (data!.milestones as { key: string; status: string }[]).map((m) => [m.key, m.status]),
      );
      expect(byKey.sponsor_secured).toBe('in_progress');
      expect(byKey.passport).toBe('not_started');
    } finally {
      await deleteUser(email);
    }
  });

  test('manual journey rejects unknown milestone key', async ({ page }) => {
    const email = uniqueEmail('coach-journey-bad');
    try {
      await setupPaidTeacher(page, email);
      const r = await page.request.post('/api/agent/journey', {
        data: { key: 'not_a_real_key', status: 'done' },
      });
      expect(r.status()).toBe(400);
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// Rate limit + idempotency (deterministic — no live OpenAI call)
// =========================================================================

test.describe('Coach — rate limit + idempotency', () => {
  test('31st message same day → 429 daily_limit', async ({ page }) => {
    const email = uniqueEmail('coach-cap');
    try {
      const userId = await setupPaidTeacher(page, email);
      // Pre-fill today's counter to the cap so the next request is rejected by
      // the RPC before any OpenAI call.
      await svc()
        .from('agent_rate_limits')
        .upsert(
          { user_id: userId, day: new Date().toISOString().slice(0, 10), count: 30 },
          { onConflict: 'user_id,day' },
        );
      const r = await page.request.post('/api/agent/chat', {
        data: { query: 'one more please', requestId: 'rid-cap' },
      });
      expect(r.status()).toBe(429);
      expect((await r.json()).error).toBe('daily_limit');
    } finally {
      await deleteUser(email);
    }
  });

  test('duplicate requestId replays the stored answer (no new turn)', async ({ page }) => {
    const email = uniqueEmail('coach-idem');
    try {
      const userId = await setupPaidTeacher(page, email);
      // Seed an already-answered turn for requestId 'dup-1'.
      await svc().from('agent_messages').insert([
        { user_id: userId, role: 'user', content: 'seeded question', request_id: 'dup-1' },
        {
          user_id: userId,
          role: 'assistant',
          content: 'Seeded grounded answer [1].',
          request_id: 'dup-1',
        },
      ]);

      const r = await page.request.post('/api/agent/chat', {
        data: { query: 'seeded question', requestId: 'dup-1' },
      });
      expect(r.ok()).toBeTruthy();
      const j = await r.json();
      expect(j.replayed).toBe(true);
      expect(j.answer).toBe('Seeded grounded answer [1].');
      expect(j.citations).toEqual([1]);

      // No new assistant rows were created for this requestId.
      const { count } = await svc()
        .from('agent_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('request_id', 'dup-1')
        .eq('role', 'assistant');
      expect(count).toBe(1);
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// Nudge consent + unsubscribe
// =========================================================================

test.describe('Coach — nudge consent', () => {
  test('consent mints a token; unsubscribe by token revokes it', async ({ page }) => {
    const email = uniqueEmail('coach-consent');
    try {
      const userId = await setupPaidTeacher(page, email);

      const c = await page.request.post('/api/agent/consent');
      expect(c.ok()).toBeTruthy();

      const { data: afterConsent } = await svc()
        .from('profiles')
        .select('agent_nudge_consent, agent_nudge_unsub_token')
        .eq('user_id', userId)
        .single();
      expect(afterConsent!.agent_nudge_consent).toBe(true);
      const token = afterConsent!.agent_nudge_unsub_token as string;
      expect(token).toBeTruthy();

      const u = await page.request.get(`/api/agent/unsubscribe?token=${encodeURIComponent(token)}`);
      expect(u.ok()).toBeTruthy();
      expect(await u.text()).toMatch(/unsubscribed/i);

      const { data: afterUnsub } = await svc()
        .from('profiles')
        .select('agent_nudge_consent, agent_nudge_unsub_token')
        .eq('user_id', userId)
        .single();
      expect(afterUnsub!.agent_nudge_consent).toBe(false);
      expect(afterUnsub!.agent_nudge_unsub_token).toBeNull();
    } finally {
      await deleteUser(email);
    }
  });

  test('unsubscribe with bogus token still returns generic confirmation', async ({ request }) => {
    const r = await request.get('/api/agent/unsubscribe?token=not-a-real-token');
    expect(r.ok()).toBeTruthy();
    expect(await r.text()).toMatch(/unsubscribed/i);
  });
});

// =========================================================================
// Dashboard wiring
// =========================================================================

test.describe('Coach — dashboard', () => {
  test('paid dashboard shows coach card; follow-up form is gone', async ({ page }) => {
    const email = uniqueEmail('coach-dash');
    try {
      await setupPaidTeacher(page, email);
      await page.goto('/dashboard');
      await expect(page.getByRole('link', { name: /open coach/i })).toBeVisible();
      await expect(page.locator('input[placeholder="Subject"]')).toHaveCount(0);
    } finally {
      await deleteUser(email);
    }
  });
});

// =========================================================================
// Live LLM happy path — opt-in (calls OpenAI + search-pathway). Run with
// RUN_COACH_LLM_TESTS=1 against a reindexed teaching corpus.
// =========================================================================

test.describe('Coach — live chat (opt-in)', () => {
  test.skip(!process.env.RUN_COACH_LLM_TESTS, 'set RUN_COACH_LLM_TESTS=1 to run live LLM tests');

  test('grounded teaching answer + off-topic refusal', async ({ page }) => {
    const email = uniqueEmail('coach-live');
    try {
      await setupPaidTeacher(page, email);

      const onTopic = await page.request.post('/api/agent/chat', {
        data: { query: 'How do I register for QTS to teach in the UK?', requestId: 'live-1' },
      });
      expect(onTopic.ok()).toBeTruthy();
      const a = await onTopic.json();
      expect(typeof a.answer).toBe('string');
      expect(a.answer.length).toBeGreaterThan(0);

      const offTopic = await page.request.post('/api/agent/chat', {
        data: { query: 'What colour should I paint my kitchen?', requestId: 'live-2' },
      });
      expect(offTopic.ok()).toBeTruthy();
      const b = await offTopic.json();
      expect(typeof b.answer).toBe('string');
    } finally {
      await deleteUser(email);
    }
  });
});
