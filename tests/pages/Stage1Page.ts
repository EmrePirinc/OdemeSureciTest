import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { expect } from '@playwright/test';
import { waitForSpinner } from '../helpers/wait.helper';

export class Stage1Page extends BasePage {
  // ... selectors remain the same

  async fillFormFields(data: { /* ... */ }): Promise<void> {
    // Replace waits with waiting for specific element states or network responses.
    if (data.formDate) {
      const formDateInput = this.page.locator('text=Form Tarihi').locator('..').locator('input').first();
      await formDateInput.fill(data.formDate);
      await this.page.waitForResponse(resp => resp.request().method() === 'POST'); // Example
    }
    // ... repeat for other fields
  }

  async clickFetchList(): Promise<void> {
    await this.clickButton('Listeyi Çek');
    // Wait for the table to be updated instead of a fixed time
    await this.page.waitForSelector(`${this.selectors.invoiceTable} tbody tr`, { state: 'attached' });
  }

  async clickSendToApproval(): Promise<void> {
    await this.clickButton('Onaya Gönder');
    await this.verifyVisible(this.selectors.successMessage); // Wait for success message
  }

  async createPaymentRequest(data: { /* ... */ }): Promise<void> {
    await this.fillFormFields(/* ... */);
    await this.selectCurrency(data.currency);
    await this.clickFetchList();

    for (const index of data.invoiceIndexes) {
      await this.selectInvoice(index);
    }

    await this.clickSave();
    await this.verifyVisible(this.selectors.createSummaryButton);

    await this.clickCreateSummary();
    await this.verifyVisible(this.selectors.sendToApprovalButton);

    if (data.sendToApproval) {
      await this.clickSendToApproval();
    }
  }

  // ... other methods refactored similarly
}
