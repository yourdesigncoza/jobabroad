import { test, expect } from '@playwright/test';

// PWA install + offline integration. Guards the manifest, theme-color/apple
// meta, the service worker file, the offline shell, and SW registration.
test.describe('PWA', () => {
  test('serves a valid web app manifest', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.ok()).toBeTruthy();

    const m = await res.json();
    expect(m.name).toContain('Jobabroad');
    expect(m.short_name).toBe('Jobabroad');
    expect(m.display).toBe('standalone');
    expect(m.start_url).toContain('/');
    expect(m.theme_color).toBe('#1B4D3E');
    // Needs both 192 + 512 icons, including a maskable variant for Android.
    const sizes = m.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    expect(
      m.icons.some((i: { purpose?: string }) => i.purpose?.includes('maskable')),
    ).toBeTruthy();
  });

  test('links the manifest and emits theme-color + apple meta', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      '#1B4D3E',
    );
    // Next 16 emits the modern standard name (the apple- prefix is deprecated)
    // plus the iOS-specific title/status-bar tags.
    await expect(
      page.locator('meta[name="mobile-web-app-capable"]'),
    ).toHaveAttribute('content', 'yes');
    await expect(
      page.locator('meta[name="apple-mobile-web-app-status-bar-style"]'),
    ).toHaveAttribute('content', 'default');
  });

  test('manifest icons resolve', async ({ request }) => {
    for (const path of ['/icon-192.png', '/icon-512.png']) {
      const res = await request.get(path);
      expect(res.ok(), `${path} should be served`).toBeTruthy();
      expect(res.headers()['content-type']).toContain('image/png');
    }
  });

  test('serves the service worker as JavaScript, no-cache', async ({ request }) => {
    const res = await request.get('/sw.js');
    expect(res.ok()).toBeTruthy();
    expect(res.headers()['content-type']).toContain('javascript');
    expect(res.headers()['cache-control']).toContain('no-cache');
    const body = await res.text();
    expect(body).toContain("addEventListener('fetch'");
  });

  test('serves the offline fallback shell', async ({ request }) => {
    const res = await request.get('/offline.html');
    expect(res.ok()).toBeTruthy();
    expect(await res.text()).toContain("You're offline");
  });

  test('does not show the install banner on the landing page', async ({ page }) => {
    // The banner is gated on intent (members/return/2nd pageview) and is
    // always suppressed on conversion-critical pages like the landing page,
    // so it must never compete with the primary CTA there.
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1200); // past the reveal delay
    await expect(
      page.getByRole('dialog', { name: 'Install Jobabroad app' }),
    ).toHaveCount(0);
  });

  test('registers the service worker on the client', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await expect
      .poll(
        () =>
          page.evaluate(async () => {
            if (!('serviceWorker' in navigator)) return false;
            const reg = await navigator.serviceWorker.getRegistration();
            return !!reg;
          }),
        { timeout: 10_000 },
      )
      .toBe(true);
  });
});
