import { test, expect } from '@playwright/test';

test.skip(process.env.SHERRY_TEST_CLOUD !== '1', 'Run explicitly against the cloud-configured server.');
test.use({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } : undefined });

test('cloud admin requires a session and rejects cross-site login', async ({ request }) => {
  const session = await request.get('/api/admin/session');
  expect(session.status()).toBe(200);
  expect(await session.json()).toMatchObject({ cloud: true, authenticated: false });
  expect((await request.get('/api/admin/content')).status()).toBe(401);
  expect((await request.put('/api/admin/content', { headers: { 'x-sherry-admin': '1' }, data: {} })).status()).toBe(401);
  expect((await request.post('/api/admin/session', { headers: { origin: 'https://elsewhere.example', 'x-sherry-admin': '1' }, data: { email: 'wrong@example.com', password: 'wrong' } })).status()).toBe(403);
});

test('cloud login is visible without exposing editor or credentials', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Sign in to your atelier' })).toBeVisible();
  await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'password');
  await expect(page.getByRole('button', { name: '保存全部修改', exact: true })).toHaveCount(0);
});
