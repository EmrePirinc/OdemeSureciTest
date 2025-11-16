import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { Stage2Page } from '../pages/Stage2Page';
import { TEST_USERS } from '../data/users';

// Test task identifier - this should be created by a setup script in a real scenario
const INTERNAL_DEPT_TASK_ID = 'PID-INTERNAL-DEPT-001';
const EXTERNAL_DEPT_TASK_ID = 'PID-EXTERNAL-DEPT-002';

test.describe('Stage 2 - Department Managers Approval', () => {
  let loginPage: LoginPage;
  let stage2Page: Stage2Page;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    stage2Page = new Stage2Page(page);
    await loginPage.navigate();
  });

  test('Internal Market Manager can approve a task', async ({ page }) => {
    await loginPage.login(TEST_USERS.INTERNAL_MARKET_MANAGER);
    await stage2Page.verifyOnPage();

    // Verify approve button is available and click it
    await expect(await stage2Page.isApproveButtonVisible(INTERNAL_DEPT_TASK_ID)).toBe(true);
    await stage2Page.approveTask(INTERNAL_DEPT_TASK_ID);

    // Verify success and that the task is gone from the list
    await stage2Page.verifySuccessMessage();
    await expect(page.locator(stage2Page.selectors.taskListItem(INTERNAL_DEPT_TASK_ID))).toBeHidden();
  });

  test('External Market Manager can approve a task', async ({ page }) => {
    await loginPage.login(TEST_USERS.EXTERNAL_MARKET_MANAGER);
    await stage2Page.verifyOnPage();

    await expect(await stage2Page.isApproveButtonVisible(EXTERNAL_DEPT_TASK_ID)).toBe(true);
    await stage2Page.approveTask(EXTERNAL_DEPT_TASK_ID);

    await stage2Page.verifySuccessMessage();
    await expect(page.locator(stage2Page.selectors.taskListItem(EXTERNAL_DEPT_TASK_ID))).toBeHidden();
  });

  test('Finance User cannot approve a Stage 2 task', async ({ page }) => {
    await loginPage.login(TEST_USERS.FINANCE_USER);
    // User will be on stage 1 page, so navigate to task list if needed
    // This part might need adjustment based on application flow
    await stage2Page.goto('/payment/tasks');

    // Verify the user cannot see the approve button for a task at this stage
    // The task might not even be visible, or if it is, the actions should be disabled.
    const isVisible = await stage2Page.isApproveButtonVisible(INTERNAL_DEPT_TASK_ID).catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('General Manager should not see or approve a Stage 2 task', async ({ page }) => {
    await loginPage.login(TEST_USERS.GENERAL_MANAGER);
    await stage2Page.goto('/payment/tasks');

    const isVisible = await stage2Page.isApproveButtonVisible(INTERNAL_DEPT_TASK_ID).catch(() => false);
    expect(isVisible).toBe(false);
  });
});
