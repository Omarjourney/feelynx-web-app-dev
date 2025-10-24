import { test, expect } from './fixtures';

test.describe('Creator dashboard', () => {
  test('renders account overview and actionable sections', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText('Jane Doe')).toBeVisible();
    await expect(page.getByText('@janed')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'My Activity' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Favorite Creators' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Creators You Might Like' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Buy Tokens' })).toBeVisible();
  });
});
