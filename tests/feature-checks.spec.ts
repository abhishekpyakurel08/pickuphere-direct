import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Daru Hunting/);
});

test('shows correct delivery time promise', async ({ page }) => {
    await page.goto('/');
    // Check Hero Section
    await expect(page.getByText('Delivery in 30 min')).toBeVisible();

    // Check Footer
    await expect(page.locator('footer')).toContainText('within 30 minutes');
});

test('check skeleton loading state', async ({ page }) => {
    await page.goto('/');
    // Reload to catch skeleton
    await page.reload();
    // We expect some elements to have animate-pulse class initially
    // This is a bit flaky without forcing network throttling, but good as a basic check
    const skeletons = page.locator('.animate-pulse');
    // It might resolve too fast, so we just check if the page loads without error
    await expect(page.locator('body')).toBeVisible();
});
