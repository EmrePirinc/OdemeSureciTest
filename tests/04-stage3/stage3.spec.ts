import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { Stage3Page } from '../pages/Stage3Page';
import { TEST_USERS } from '../data/users';

const TASK_ID_FOR_STAGE3 = 'PID-FINANCE-APPROVAL-003';
const DUMMY_FILE_PATH = 'statement.pdf';

test.describe('Stage 3 - Finance User Actions', () => {
  let loginPage: LoginPage;
  let stage3Page: Stage3Page;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    stage3Page = new Stage3Page(page);
    await loginPage.navigate();
    await loginPage.login(TEST_USERS.FINANCE_USER);
    await stage3Page.navigateToTask(TASK_ID_FOR_STAGE3);
  });

  test('Approve button should be disabled before file upload', async () => {
    // Verify that the approve button is disabled initially
    await expect(await stage3Page.isApproveButtonEnabled()).toBe(false);
  });

  test('Approval fails if statement file is not uploaded', async ({ page }) => {
    // Attempt to click the approve button (assuming it's not disabled but triggers validation)
    // This test case might need to be adjusted if the button is fully disabled.
    // Let's assume a scenario where the button is clickable but shows an error.
    await stage3Page.clickApprove().catch(e => console.log('Button click was expected to be blocked or fail'));

    // Check for a validation error message
    const hasError = await stage3Page.hasValidationError();
    expect(hasError).toBe(true);
  });

  test('Finance User can upload a statement and approve the task', async () => {
    // Upload the required file
    await stage3Page.uploadStatement(DUMMY_FILE_PATH);

    // Now the approve button should be enabled
    await expect(await stage3Page.isApproveButtonEnabled()).toBe(true);

    // Click approve and verify success
    await stage3Page.clickApprove();
    await stage3Page.verifySuccessMessage();
  });

  test('Other roles cannot access or action Stage 3 tasks', async ({ browser }) => {
    // Test with a user who shouldn't have access
    const otherUsers = [TEST_USERS.INTERNAL_MARKET_MANAGER, TEST_USERS.GENERAL_MANAGER];

    for (const user of otherUsers) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const newLoginPage = new LoginPage(page);
      const newStage3Page = new Stage3Page(page);

      await newLoginPage.goto();
      await newLoginPage.login(user);

      // Attempt to navigate to the task URL and expect a failure (e.g., redirect or error page)
      await newStage3Page.navigateToTask(TASK_ID_FOR_STAGE3).catch(() => {});
      await expect(page.locator(newStage3Page.selectors.pageTitle)).toBeHidden();

      await context.close();
    }
  });
});
