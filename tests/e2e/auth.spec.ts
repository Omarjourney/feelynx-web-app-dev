import { test, expect } from './fixtures';

const userEmail = 'test-user@example.com';
const userPassword = 'StrongPass123!';

test.describe('Authentication flow', () => {
  test('signs in with Supabase stub responses and routes to home', async ({ page }) => {
    await page.goto('/auth');

    await expect(page.getByRole('heading', { name: 'Welcome to Feelynx' })).toBeVisible();

    await page.getByPlaceholder('Email').fill(userEmail);
    await page.getByPlaceholder('Password').fill(userPassword);

    const submitButton = page.getByRole('button', { name: 'Sign In' });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { name: 'Join the Hottest Creators Now' }),
    ).toBeVisible();
  });

  test('allows switching between sign-in and sign-up modes', async ({ page }) => {
    await page.goto('/auth');

    const signUpTab = page.getByRole('tab', { name: 'Sign Up' });
    await signUpTab.click();
    await expect(signUpTab).toHaveAttribute('aria-selected', 'true');

    await page.getByPlaceholder('Email').fill('new-user@example.com');
    await page.getByPlaceholder('Password').fill('AnotherPass123!');
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeEnabled();
  });
});
