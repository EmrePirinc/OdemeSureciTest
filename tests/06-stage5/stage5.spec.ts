import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { Stage5Page } from '../pages/Stage5Page';
import { TEST_USERS, TEST_DATA } from '../data/users';

const TASK_ID_FOR_STAGE5 = 'PID-GENERAL-MGR-005';

test.describe('Stage 5 - General Manager Actions', () => {
  let loginPage: LoginPage;
  let stage5Page: Stage5Page;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    stage5Page = new Stage5Page(page);
    await loginPage.navigate();
    await loginPage.login(TEST_USERS.GENERAL_MANAGER);
    await stage5Page.navigateToTask(TASK_ID_FOR_STAGE5);
  });

  test('Form fields should be read-only for the General Manager', async () => {
    await stage5Page.verifyFieldsAreReadOnly();
  });

  test('General Manager can approve the task', async () => {
    // Approve button should be enabled for action
    await expect(await stage5Page.isApproveButtonEnabled()).toBe(true);
    await stage5Page.approveTask();
    await stage5Page.verifySuccessMessage();
  });

  test('General Manager can reject the task and send it back to Stage 4', async () => {
    const rejectionReason = TEST_DATA.REJECTION_REASONS[1];
    await stage5Page.rejectTask(rejectionReason);
    await stage5Page.verifySuccessMessage();
    // Verification could be extended by logging in as Finance Manager to see if the task is back.
  });

  test('Unauthorized users cannot access Stage 5 tasks', async ({ browser }) => {
    const unauthorizedUsers = [TEST_USERS.FINANCE_MANAGER, TEST_USERS.EXTERNAL_MARKET_MANAGER];

    for (const user of unauthorizedUsers) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const newLoginPage = new LoginPage(page);
      const newStage5Page = new Stage5Page(page);

      await newLoginPage.goto();
      await newLoginPage.login(user);

      await newStage5Page.navigateToTask(TASK_ID_FOR_STAGE5).catch(() => {});
      await expect(page.locator(newStage5Page.selectors.pageTitle)).toBeHidden();

      await context.close();
    }
  });
});
