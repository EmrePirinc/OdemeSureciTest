import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Stage4Page - Stage 4 (Finans Müdürü Onayı) sayfası için Page Object
 * Finans Müdürü tarafından kullanılır
 */
export class Stage4Page extends BasePage {
  // Selectors
  private readonly selectors = {
    // Görev Listesi
    taskListTable: 'table',
    taskListItem: (taskName: string) => `text=${taskName}`,

    // Butonlar
    approveButton: 'button:has-text("Onayla")',
    rejectButton: 'button:has-text("Geri Ata")',

    // Reddetme Modalı
    rejectionReasonInput: 'textarea[name="rejectionReason"]',
    confirmRejectionButton: 'button:has-text("Geri Gönder")',

    // Genel
    pageTitle: 'h1:has-text("Görev Detayları")',
    successMessage: '.alert-success',
    errorMessage: '.alert-error'
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

    // Modalın açılmasını bekle
    await this.verifyVisible(this.selectors.rejectionReasonInput);

    // Nedeni gir ve onayla
    await this.fillInput(this.selectors.rejectionReasonInput, reason);
    await this.clickButton('Geri Gönder');
    await this.waitForSpinner();
  }

  /**
   * Reddetme işlemi sırasında neden girilmediğinde hata alındığını doğrula
   */
  async verifyRejectionReasonIsRequired(): Promise<void> {
    await this.clickButton('Geri Ata');
    await this.verifyVisible(this.selectors.rejectionReasonInput);

    // Neden girmeden onayla
    await this.clickButton('Geri Gönder');

    // Hata mesajını doğrula
    await this.verifyVisible(this.selectors.errorMessage);
  }
}
