import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CompletedProcessesPage } from '../pages/CompletedProcessesPage';
import { TEST_USERS } from '../data/users';

// This ID should be one that has been fully processed in previous stages
const COMPLETED_TASK_ID = 'PID-PAYMENT-FINAL-006';
const NON_EXISTENT_TASK_ID = 'PID-NON-EXISTENT-999';

test.describe('Completed Processes Verification', () => {
  let loginPage: LoginPage;
  let completedPage: CompletedProcessesPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    completedPage = new CompletedProcessesPage(page);
    await loginPage.goto();
    // Admin or a finance user should be able to see completed processes
    await loginPage.login(TEST_USERS.ADMIN);
    await completedPage.navigate();
  });

  test('A completed process should be searchable and listed', async () => {
    await completedPage.searchForProcess(COMPLETED_TASK_ID);
    await completedPage.verifyProcessIsListed();
  });

  test('Searching for a non-existent or incomplete process should yield no results', async () => {
    await completedPage.searchForProcess(NON_EXISTENT_TASK_ID);
    await completedPage.verifyProcessIsNotListed();
  });
});
