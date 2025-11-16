import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { Stage6Page } from '../pages/Stage6Page';
import { TEST_USERS } from '../data/users';

const TASK_ID_FOR_STAGE6 = 'PID-PAYMENT-FINAL-006';

test.describe('Stage 6 - Payment Instruction and Completion', () => {
  let loginPage: LoginPage;
  let stage6Page: Stage6Page;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    stage6Page = new Stage6Page(page);
    await loginPage.navigate();
    await loginPage.login(TEST_USERS.FINANCE_USER);
    await stage6Page.navigateToTask(TASK_ID_FOR_STAGE6);
  });

  test('Finance User can download the Excel instruction file', async () => {
    const downloadedFileName = await stage6Page.downloadInstructionFile();

    // Verify the file name follows the expected pattern
    expect(downloadedFileName).not.toBeNull();
    expect(downloadedFileName).toContain('PaymentInstruction');
    expect(downloadedFileName).toContain('.xlsx');
  });

  test('Finance User can complete the process', async () => {
    await stage6Page.completeProcess();
    await stage6Page.verifySuccessMessage();
    // After completion, the task should no longer be in the active task list.
    // This could be verified by navigating back to the task list.
  });

  test('Unauthorized users cannot access Stage 6 tasks', async ({ browser }) => {
    const unauthorizedUsers = [TEST_USERS.GENERAL_MANAGER, TEST_USERS.FINANCE_MANAGER];

    for (const user of unauthorizedUsers) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const newLoginPage = new LoginPage(page);
      const newStage6Page = new Stage6Page(page);

      await newLoginPage.goto();
      await newLoginPage.login(user);

      await newStage6Page.navigateToTask(TASK_ID_FOR_STAGE6).catch(() => {});
      await expect(page.locator(newStage6Page.selectors.pageTitle)).toBeHidden();

      await context.close();
    }
  });
});
