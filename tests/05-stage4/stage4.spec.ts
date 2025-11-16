import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { Stage4Page } from '../pages/Stage4Page';
import { TEST_USERS, TEST_DATA } from '../data/users';

const TASK_ID_FOR_STAGE4 = 'PID-FINANCE-MGR-004';

test.describe('Stage 4 - Finance Manager Actions', () => {
  let loginPage: LoginPage;
  let stage4Page: Stage4Page;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    stage4Page = new Stage4Page(page);
    await loginPage.navigate();
    await loginPage.login(TEST_USERS.FINANCE_MANAGER);
    await stage4Page.navigateToTask(TASK_ID_FOR_STAGE4);
  });

  test('Finance Manager can approve a task', async () => {
    await stage4Page.approveTask();
    await stage4Page.verifySuccessMessage();
  });

  test('Rejection requires a reason', async () => {
    await stage4Page.verifyRejectionReasonIsRequired();
  });

  test('Finance Manager can reject a task and send it back to Stage 3', async () => {
    const rejectionReason = TEST_DATA.REJECTION_REASONS[0];
    await stage4Page.rejectTask(rejectionReason);
    await stage4Page.verifySuccessMessage();
    // Here, you could add further verification by logging in as the FINANCE_USER
    // and checking if the task has reappeared in their list with the correct status.
  });

  test('Unauthorized users cannot access Stage 4 tasks', async ({ browser }) => {
    const unauthorizedUsers = [TEST_USERS.FINANCE_USER, TEST_USERS.INTERNAL_MARKET_MANAGER];

    for (const user of unauthorizedUsers) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const newLoginPage = new LoginPage(page);
      const newStage4Page = new Stage4Page(page);

      await newLoginPage.goto();
      await newLoginPage.login(user);

      await newStage4Page.navigateToTask(TASK_ID_FOR_STAGE4).catch(() => {});
      await expect(page.locator(newStage4Page.selectors.pageTitle)).toBeHidden();

      await context.close();
    }
  });
});
