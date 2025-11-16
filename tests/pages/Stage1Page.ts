import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { expect } from '@playwright/test';
import { waitForSpinner } from '../helpers/wait.helper';

export class Stage1Page extends BasePage {
  // ... selectors remain the same

  private readonly selectors = {
    invoiceTable: 'table',
    successMessage: '.success, .alert-success, [class*="success"]',
    createSummaryButton: 'button:has-text("Özet Oluştur")',
    sendToApprovalButton: 'button:has-text("Onaya Gönder")',
    currencySelect: 'select[name="currency"], select:has-text("Para Birimi")',
    dueDateStartInput: 'input[name="dueDateStart"], input[placeholder*="Başlangıç"]',
    dueDateEndInput: 'input[name="dueDateEnd"], input[placeholder*="Bitiş"]',
    invoiceCheckbox: 'input[type="checkbox"]',
    saveButton: 'button:has-text("Kaydet")',
    fetchListButton: 'button:has-text("Listeyi Çek")',
  };

  /**
   * Navigate to the payment tasks page
   */
  async navigate(): Promise<void> {
    // Login sonrası zaten /payment/tasks sayfasındayız
    // Eğer değilse, yönlendir
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/payment')) {
      await this.goto('/payment/tasks');
    }
    // Sayfanın yüklendiğini doğrula
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await this.wait(500);
  }

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

  /**
   * Para birimi seç
   */
  async selectCurrency(currency: string): Promise<void> {
    const currencySelect = this.page.locator('select').first();
    await currencySelect.selectOption({ label: currency });
    await this.wait(500);
  }

  /**
   * Başlangıç tarihi seç
   */
  async setDueDateStart(date: string): Promise<void> {
    const dateInput = this.page.locator('input[type="date"]').first();
    await dateInput.fill(date);
    await this.wait(300);
  }

  /**
   * Bitiş tarihi seç
   */
  async setDueDateEnd(date: string): Promise<void> {
    const dateInput = this.page.locator('input[type="date"]').nth(1);
    await dateInput.fill(date);
    await this.wait(300);
  }

  /**
   * Fatura seç (index ile)
   */
  async selectInvoice(index: number): Promise<void> {
    const checkboxes = this.page.locator('input[type="checkbox"]');
    const checkbox = checkboxes.nth(index);
    await checkbox.check();
    await this.wait(300);
  }

  /**
   * Tüm faturaları seç
   */
  async selectAllInvoices(): Promise<void> {
    const selectAllCheckbox = this.page.locator('input[type="checkbox"]').first();
    await selectAllCheckbox.check();
    await this.wait(500);
  }

  /**
   * Kaydet butonuna tıkla
   */
  async clickSave(): Promise<void> {
    await this.clickButton('Kaydet');
    await this.wait(1000);
  }

  /**
   * Özet Oluştur butonuna tıkla
   */
  async clickCreateSummary(): Promise<void> {
    await this.clickButton('Özet Oluştur');
    await this.wait(1000);
  }

  /**
   * Başarı mesajını doğrula
   */
  async verifySuccessMessage(): Promise<void> {
    await this.verifyVisible(this.selectors.successMessage);
  }

  async createPaymentRequest(data: {
    dueDateStart?: string;
    dueDateEnd?: string;
    currency?: string;
    invoiceIndexes?: number[];
    sendToApproval?: boolean;
  }): Promise<void> {
    if (data.dueDateStart) {
      await this.setDueDateStart(data.dueDateStart);
    }
    if (data.dueDateEnd) {
      await this.setDueDateEnd(data.dueDateEnd);
    }
    if (data.currency) {
      await this.selectCurrency(data.currency);
    }

    await this.clickFetchList();

    if (data.invoiceIndexes) {
      for (const index of data.invoiceIndexes) {
        await this.selectInvoice(index);
      }
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
