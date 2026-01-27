import { test, expect } from '@playwright/test';

test('products page loads with skeleton', async ({ page }) => {
    await page.goto('/products');

    // Check if the grid exists
    // Check if the product grid exists
    await expect(page.locator('.grid.sm\\:grid-cols-2').first()).toBeVisible();

    // Verify SEO title matches category "All"
    await expect(page).toHaveTitle(/Premium Collection/);

    // Verify items are loaded (mock data or api)
    // We wait for at least one product card to appear
    await expect(page.locator('.card-product').first()).toBeVisible();
});

test('search functionality', async ({ page }) => {
    await page.goto('/products');

    const searchInput = page.locator('input[placeholder="Search products..."]');
    await searchInput.fill('Whiskey');

    // Should verify filtering happens
    // Depending on mock data/api, we assume some list update
    // For now just checking input works
    await expect(searchInput).toHaveValue('Whiskey');
});
