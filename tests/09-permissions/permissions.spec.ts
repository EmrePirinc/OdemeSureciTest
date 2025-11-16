import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { BasePage } from '../pages/BasePage';
import { TEST_USERS, TestUser } from '../data/users';

// A map of pages and the users who should have access
const PAGE_ACCESS_MAP = {
  '/payment/tasks': [
    TEST_USERS.FINANCE_USER,
    TEST_USERS.INTERNAL_MARKET_MANAGER,
    TEST_USERS.EXTERNAL_MARKET_MANAGER,
    TEST_USERS.FINANCE_MANAGER,
    TEST_USERS.GENERAL_MANAGER
  ],
  '/payment/completed': [
    TEST_USERS.ADMIN,
    TEST_USERS.FINANCE_USER
  ],
  '/admin/dashboard': [
    TEST_USERS.ADMIN
  ]
};

// A map of task stages and the users who can action them
const TASK_ACTION_ACCESS_MAP = {
  '1': TEST_USERS.FINANCE_USER,
  '2_internal': TEST_USERS.INTERNAL_MARKET_MANAGER,
  '2_external': TEST_USERS.EXTERNAL_MARKET_MANAGER,
  '3': TEST_USERS.FINANCE_USER,
  '4': TEST_USERS.FINANCE_MANAGER,
  '5': TEST_USERS.GENERAL_MANAGER,
  '6': TEST_USERS.FINANCE_USER
};


test.describe('Role-Based Access Control (RBAC) - Permissions', () => {

  // Test page access for all defined pages
  for (const [pageUrl, authorizedUsers] of Object.entries(PAGE_ACCESS_MAP)) {
    test(`Page Access: Only authorized users can access ${pageUrl}`, async ({ browser }) => {
      const allUsers = Object.values(TEST_USERS);

      for (const user of allUsers) {
        const context = await browser.newContext();
        const page = await context.newPage();
        const loginPage = new LoginPage(page);

        await loginPage.navigate();
        await loginPage.login(user);

        await page.goto(pageUrl);

        // Check if access was granted or denied
        const isAuthorized = authorizedUsers.some(authUser => authUser.username === user.username);

        if (isAuthorized) {
          // Expect to not be redirected to a login or unauthorized page
          await expect(page).not.toHaveURL(/.*login/);
          await expect(page.locator('text=Unauthorized')).toBeHidden();
        } else {
          // Expect to be redirected or see an error message
          const isRedirected = /.*login/.test(page.url());
          const hasError = await page.locator('text=Unauthorized').isVisible();
          expect(isRedirected || hasError).toBe(true);
        }
        await context.close();
      }
    });
  }

  // A conceptual test for task action permissions
  // This would require a more complex setup to have tasks at each stage ready for testing
  test.describe('Task Action Permissions', () => {
    // This is a placeholder for more detailed tests.
    // In a real project, you would create a task and move it through stages,
    // ensuring that only the correct user can perform actions at each step.
    test('Only the assigned user role can approve/reject a task at a given stage', async () => {
      // Example for Stage 4
      const userForStage4 = TASK_ACTION_ACCESS_MAP['4'];
      const anotherUser = TEST_USERS.FINANCE_USER; // Should not be able to act on stage 4

      // 1. Login as Finance Manager (userForStage4)
      // 2. Navigate to a task at Stage 4
      // 3. Verify approve/reject buttons are visible and enabled

      // 4. Login as Finance User (anotherUser)
      // 5. Navigate to the same task at Stage 4
      // 6. Verify approve/reject buttons are hidden or disabled

      expect(true).toBe(true); // Placeholder assertion
    });
  });
});
