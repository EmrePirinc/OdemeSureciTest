import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Stage5Page - Stage 5 (Genel Müdür Onayı) sayfası için Page Object
 * Genel Müdür tarafından kullanılır
 */
export class Stage5Page extends BasePage {
  // Selectors
  private readonly selectors = {
    // Butonlar
    approveButton: 'button:has-text("Onayla")',
    rejectButton: 'button:has-text("Geri Ata")',

    // Salt Okunur Alanlar (Örnek)
    readOnlyAmountField: 'input[name="amount"][disabled]',
    readOnlyVendorField: 'input[name="vendorName"][readonly]',

    // Reddetme Modalı
    rejectionReasonInput: 'textarea[name="rejectionReason"]',
    confirmRejectionButton: 'button:has-text("Geri Gönder")',

    // Genel
    pageTitle: 'h1:has-text("Görev Detayları")',
    successMessage: '.alert-success',
    errorMessage: '.alert-error',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Görev detay sayfasına git ve sayfanın yüklendiğini doğrula
   */
  async navigateToTask(taskId: string): Promise<void> {
    await this.goto(`/payment/task/${taskId}`);
    await this.verifyVisible(this.selectors.pageTitle);
  }

  /**
   * Görevi onayla
   */
  async approveTask(): Promise<void> {
    await this.clickButton('Onayla');
    await this.waitForSpinner();
  }

  /**
   * Görevi geri ata (reddet)
   * @param reason Reddetme nedeni
   */
  async rejectTask(reason: string): Promise<void> {
    await this.clickButton('Geri Ata');
    await this.verifyVisible(this.selectors.rejectionReasonInput);
    await this.fillInput(this.selectors.rejectionReasonInput, reason);
    await this.clickButton('Geri Gönder');
    await this.waitForSpinner();
  }

  /**
   * Onay butonunun etkin olup olmadığını kontrol et
   */
  async isApproveButtonEnabled(): Promise<boolean> {
    return this.isEnabled(this.selectors.approveButton);
  }

  /**
   * Alanların salt okunur olduğunu doğrula
   */
  async verifyFieldsAreReadOnly(): Promise<void> {
    await this.verifyDisabled(this.selectors.readOnlyAmountField);
    // 'readonly' attribute'ını kontrol etmek için özel bir doğrulama gerekebilir
    const vendorField = this.locator(this.selectors.readOnlyVendorField);
    await expect(vendorField).toHaveAttribute('readonly', '');
  }
}
