import { test, expect } from '@playwright/test';
import { deleteUser, registerAndLogin, uniqueEmail, uniquePhone } from './helpers';

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
      await expect(page.getByText('Step 1 of 7')).toBeVisible();

      // Age + City are empty — Next is blocked and both fields flag an error.
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expect(page.getByText('Please answer this before continuing.')).toHaveCount(2);
      await expect(page.getByText('Step 1 of 7')).toBeVisible();

      // Filling them clears the errors and the same Next now advances.
      await page.locator('[id="field-personal.age"] input').fill('32');
      await page.locator('[id="field-personal.city_province"] input').fill('Cape Town');
      await expect(page.getByText('Please answer this before continuing.')).toHaveCount(0);
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await expect(page.getByText('Step 2 of 7')).toBeVisible();
    } finally {
      await deleteUser(email);
    }
  });
});
