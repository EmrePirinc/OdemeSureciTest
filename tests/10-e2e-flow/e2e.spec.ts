import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { Stage1Page } from '../pages/Stage1Page';
import { Stage2Page } from '../pages/Stage2Page';
import { Stage3Page } from '../pages/Stage3Page';
import { Stage4Page } from '../pages/Stage4Page';
import { Stage5Page } from '../pages/Stage5Page';
import { Stage6Page } from '../pages/Stage6Page';
import { CompletedProcessesPage } from '../pages/CompletedProcessesPage';
import { TEST_USERS, STAGE_USERS, TEST_DATA } from '../data/users';

// This test will simulate a full lifecycle of a payment request.
// It requires state to be passed between stages (e.g., the task ID).
// In a real-world scenario, you would fetch this from the UI or have a setup script.
let taskId = `E2E-${Date.now()}`;

test.describe('End-to-End Payment Approval Flow', () => {

  test.beforeAll(async ({ browser }) => {
    // This is where you might create a new payment request via API to get a clean task ID.
    // For this simulation, we'll just use the generated one.
    console.log(`Starting E2E test with Task ID: ${taskId}`);
  });

  test('Stage 1: Finance User creates a payment request', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const stage1Page = new Stage1Page(page);

    await loginPage.goto();
    await loginPage.login(STAGE_USERS.STAGE_1);

    // Create a new payment request
    await stage1Page.createPaymentRequest({
      dueDateStart: TEST_DATA.VALID_DATE_RANGE.startDate,
      dueDateEnd: TEST_DATA.VALID_DATE_RANGE.endDate,
      currency: 'TRY',
      invoiceIndexes: [0, 1], // Select first two invoices
      sendToApproval: true
    });

    await stage1Page.verifySuccessMessage();
    // Here you would ideally capture the new task ID from the success message or UI.
  });

  test('Stage 2: Department Manager approves the request', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const stage2Page = new Stage2Page(page);

    await loginPage.goto();
    // Assuming it's an internal department task
    await loginPage.login(STAGE_USERS.STAGE_2_INTERNAL);
    await stage2Page.verifyOnPage();

    await stage2Page.approveTask(taskId);
    await stage2Page.verifySuccessMessage();
  });

  test('Stage 3: Finance User uploads statement and approves', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const stage3Page = new Stage3Page(page);

    await loginPage.goto();
    await loginPage.login(STAGE_USERS.STAGE_3);
    await stage3Page.navigateToTask(taskId);

    await stage3Page.uploadStatement('statement.pdf');
    await stage3Page.clickApprove();
    await stage3Page.verifySuccessMessage();
  });

  test('Stage 4: Finance Manager approves the request', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const stage4Page = new Stage4Page(page);

    await loginPage.goto();
    await loginPage.login(STAGE_USERS.STAGE_4);
    await stage4Page.navigateToTask(taskId);

    await stage4Page.approveTask();
    await stage4Page.verifySuccessMessage();
  });

  test('Stage 5: General Manager approves the request', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const stage5Page = new Stage5Page(page);

    await loginPage.goto();
    await loginPage.login(STAGE_USERS.STAGE_5);
    await stage5Page.navigateToTask(taskId);

    await stage5Page.approveTask();
    await stage5Page.verifySuccessMessage();
  });

  test('Stage 6: Finance User downloads instructions and completes', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const stage6Page = new Stage6Page(page);

    await loginPage.goto();
    await loginPage.login(STAGE_USERS.STAGE_6);
    await stage6Page.navigateToTask(taskId);

    await stage6Page.downloadInstructionFile();
    await stage6Page.completeProcess();
    await stage6Page.verifySuccessMessage();
  });

  test('Final Verification: Process is in the completed list', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const completedPage = new CompletedProcessesPage(page);

    await loginPage.goto();
    await loginPage.login(TEST_USERS.ADMIN);
    await completedPage.navigate();

    await completedPage.searchForProcess(taskId);
    await completedPage.verifyProcessIsListed();
  });
});
