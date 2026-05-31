import { test, expect } from '@playwright/test';
import {
  deleteUser,
  findUserIdByEmail,
  registerAndLogin,
  svc,
  uniqueEmail,
  uniquePhone,
} from './helpers';

const PASSWORD = 'Test12345!';

test.describe('Assessment wizard', () => {
  test('full name is prefilled from registration and locked', async ({ page }) => {
    const email = uniqueEmail('wizard-name');
    const name = 'Wizard Prefill Tester';
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name,
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      await page.goto('/members/teaching/assessment');
      const fullName = page.locator('[id="field-personal.full_name"] input');
      await expect(fullName).toHaveValue(name);
      await expect(fullName).toHaveJSProperty('readOnly', true);
    } finally {
      await deleteUser(email);
    }
  });

  test('cannot advance a step while required fields are empty', async ({ page }) => {
    const email = uniqueEmail('wizard-required');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Wizard Required Tester',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      await page.goto('/members/teaching/assessment');
      await expect(page.getByText('Step 1 of 8')).toBeVisible();

      // Age + City are empty — Next is blocked and both fields flag an error.
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expect(page.getByText('Please answer this before continuing.')).toHaveCount(2);
      await expect(page.getByText('Step 1 of 8')).toBeVisible();

      // Filling them clears the errors and the same Next now advances.
      await page.locator('[id="field-personal.age"] input').fill('32');
      await page.locator('[id="field-personal.city_province"] input').fill('Cape Town');
      await expect(page.getByText('Please answer this before continuing.')).toHaveCount(0);
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expect(page.getByText('Step 2 of 8')).toBeVisible();
    } finally {
      await deleteUser(email);
    }
  });

  test('final "About you" step is an optional free-text field that persists + submits', async ({ page }) => {
    const email = uniqueEmail('wizard-about');
    await registerAndLogin(page, {
      email,
      password: PASSWORD,
      name: 'Wizard About Tester',
      phone: uniquePhone(),
      category: 'teaching',
    });
    try {
      const userId = await findUserIdByEmail(email);
      // Seed a draft with every structured step complete so the wizard opens
      // straight on the appended "About you" step (its slug isn't in the list).
      const { error } = await svc().from('assessments').insert({
        user_id: userId,
        category: 'teaching',
        schema_version: 1,
        status: 'draft',
        completed_step_slugs: [
          'personal', 'situation', 'qualifications', 'registration',
          'experience', 'documents', 'readiness',
        ],
        data: { 'personal.full_name': { q: 'personal.full_name.v1', v: 'Wizard About Tester' } },
      });
      if (error) throw error;

      await page.goto('/members/teaching/assessment');

      // Lands on the last step: the optional free-text field.
      await expect(page.getByText('Step 8 of 8')).toBeVisible();
      await expect(page.getByText('Tell us about yourself')).toBeVisible();
      const about = page.locator('[id="field-about.summary"] textarea');
      await expect(about).toBeVisible();

      await about.fill('I have a hearing impairment and need a supportive school.');
      await expect(about).toHaveValue(/hearing impairment/);

      // It's the last step and optional, so submission is offered with it blank
      // — no "answer this" error and the Submit button is the primary action.
      // (We don't click Submit here: with payments shelved that kicks off the
      // full report generation, which is out of scope for this UI test.)
      await expect(
        page.getByRole('button', { name: /submit eligibility check/i }),
      ).toBeVisible();
      await expect(page.getByText('Please answer this before continuing.')).toHaveCount(0);

      // The debounced autosave persists the free-text to the draft row.
      await expect
        .poll(
          async () => {
            const { data: row } = await svc()
              .from('assessments')
              .select('data')
              .eq('user_id', userId)
              .single();
            const saved = (row?.data as Record<string, { v: unknown }>)['about.summary'];
            return saved?.v ?? '';
          },
          { timeout: 6000 },
        )
        .toContain('hearing impairment');
    } finally {
      await deleteUser(email);
    }
  });
});
