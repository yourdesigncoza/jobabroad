import { test, expect } from '@playwright/test';
import {
  deleteUser,
  findUserIdByEmail,
  insertSubmittedTeachingAssessment,
  registerAndLogin,
  svc,
  uniqueEmail,
  uniquePhone,
} from './helpers';

const PASSWORD = 'Test12345!';

// The score page is where an assessment-completer enters the proactive-nudge
// funnel: it seeds their journey + starts the idle clock (so the daily cron can
// later reach them) and offers the consent opt-in. These assertions cover that
// entry point; the cron's claim itself is exercised against the DB function.
test.describe('Follow-up nudge funnel — score-page entry', () => {
  test('completer is seeded into the funnel and can opt in to nudges', async ({ page }) => {
    const email = uniqueEmail('nudge-optin');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Nudge Optin',
      phone: uniquePhone(),
      category: 'teaching',
    });
    const userId = await findUserIdByEmail(email);
    await insertSubmittedTeachingAssessment(userId);

    try {
      await page.goto('/members/teaching/score');

      // Consent opt-in is shown (free user + gate off → coach reachable).
      const consentLabel = page.locator('label', { hasText: /email me reminders about my next steps/i });
      await expect(consentLabel).toBeVisible();

      // Journey row is persisted with at least one incomplete milestone — without
      // this the cron has nothing to nudge toward. (Seeded via waitUntil, so poll.)
      await expect
        .poll(
          async () => {
            const { data } = await svc()
              .from('user_journey')
              .select('incomplete_count')
              .eq('user_id', userId)
              .maybeSingle();
            return data?.incomplete_count ?? -1;
          },
          { timeout: 10_000 },
        )
        .toBeGreaterThan(0);

      // Idle clock started (agent_last_active_at stamped).
      await expect
        .poll(
          async () => {
            const { data } = await svc()
              .from('profiles')
              .select('agent_last_active_at')
              .eq('user_id', userId)
              .single();
            return data?.agent_last_active_at ? 'set' : 'null';
          },
          { timeout: 10_000 },
        )
        .toBe('set');

      // Opt in: records consent + mints the unsubscribe token the cron requires.
      await consentLabel.getByRole('checkbox').click();
      await expect(consentLabel).toHaveCount(0); // hides itself on success

      await expect
        .poll(
          async () => {
            const { data } = await svc()
              .from('profiles')
              .select('agent_nudge_consent, agent_nudge_unsub_token')
              .eq('user_id', userId)
              .single();
            return data?.agent_nudge_consent === true && Boolean(data?.agent_nudge_unsub_token);
          },
          { timeout: 10_000 },
        )
        .toBe(true);
    } finally {
      await deleteUser(email);
    }
  });

  test('re-viewing the score does not reset the idle clock', async ({ page }) => {
    const email = uniqueEmail('nudge-clock');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Nudge Clock',
      phone: uniquePhone(),
      category: 'teaching',
    });
    const userId = await findUserIdByEmail(email);
    await insertSubmittedTeachingAssessment(userId);

    try {
      await page.goto('/members/teaching/score');
      await expect
        .poll(
          async () => {
            const { data } = await svc()
              .from('profiles')
              .select('agent_last_active_at')
              .eq('user_id', userId)
              .single();
            return data?.agent_last_active_at ?? null;
          },
          { timeout: 10_000 },
        )
        .not.toBeNull();

      const { data: first } = await svc()
        .from('profiles')
        .select('agent_last_active_at')
        .eq('user_id', userId)
        .single();

      // Backdate it 8 days as if the prospect went idle, then revisit the score.
      const eightDaysAgo = new Date(Date.now() - 8 * 864e5).toISOString();
      await svc().from('profiles').update({ agent_last_active_at: eightDaysAgo }).eq('user_id', userId);
      await page.goto('/members/teaching/score');
      await page.waitForTimeout(1500); // let any waitUntil write flush

      const { data: after } = await svc()
        .from('profiles')
        .select('agent_last_active_at')
        .eq('user_id', userId)
        .single();
      // The set-only-if-null guard means the backdated value survives — the
      // prospect stays idle-eligible instead of being reset to "active" on revisit.
      // Compare by instant (Postgres returns +00:00, not Z).
      expect(Date.parse(after!.agent_last_active_at!)).toBe(Date.parse(eightDaysAgo));
      expect(Date.parse(after!.agent_last_active_at!)).toBeLessThan(
        Date.parse(first!.agent_last_active_at!),
      );
    } finally {
      await deleteUser(email);
    }
  });
});
