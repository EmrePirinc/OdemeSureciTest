import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { TEST_USERS } from './data/users';

test.describe('Authenticated User Experience', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USERS.FINANCE_USER);
  });

  test('TC-AUTH-001: Dashboard should load with essential components', async ({ page }) => {
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('.widget')).toHaveCountGreaterThan(0);
    await page.screenshot({ path: 'screenshots/tc-auth-001-dashboard.png' });
  });

  test('TC-AUTH-002: Main navigation should be visible and contain links', async ({ page }) => {
    const nav = page.locator('nav.main-navigation');
    await expect(nav).toBeVisible();
    const menuItems = await nav.locator('a, button').all();
    expect(menuItems.length).toBeGreaterThan(2);
    await page.screenshot({ path: 'screenshots/tc-auth-002-navigation.png' });
  });

  test('TC-AUTH-004: User should be able to log out', async ({ page }) => {
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();
    await expect(page).toHaveURL(/.*login/);
    await page.screenshot({ path: 'screenshots/tc-auth-004-after-logout.png' });
  });

  test('TC-AUTH-007: Search functionality should filter results', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();

    const initialRowCount = await page.locator('table tbody tr').count();
    await searchInput.fill('test search');
    await page.waitForResponse(resp => resp.url().includes('/search'));

    const filteredRowCount = await page.locator('table tbody tr').count();
    expect(filteredRowCount).toBeLessThan(initialRowCount);
    await page.screenshot({ path: 'screenshots/tc-auth-007-search.png' });
  });
});
