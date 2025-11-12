import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Stage6Page - Stage 6 (Ödeme Talimatı ve Tamamlama) sayfası için Page Object
 * Finans Kullanıcısı tarafından kullanılır
 */
export class Stage6Page extends BasePage {
  // Selectors
  private readonly selectors = {
    // Butonlar
    downloadExcelButton: 'button:has-text("Excel Talimatı İndir")',
    completeProcessButton: 'button:has-text("İşlemi Tamamla")',

    // Genel
    pageTitle: 'h1:has-text("Ödeme Talimatı")',
    successMessage: '.alert-success',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Görev detay sayfasına git ve sayfanın yüklendiğini doğrula
   */
  async navigateToTask(taskId: string): Promise<void> {
    await this.goto(`/payment/task/${taskId}/instruction`);
    await this.verifyVisible(this.selectors.pageTitle);
  }

  /**
   * Excel talimat dosyasını indir
   * @returns İndirilen dosyanın adı
   */
  async downloadInstructionFile(): Promise<string> {
    return this.downloadFile(this.selectors.downloadExcelButton);
  }

  /**
   * İşlemi tamamla
   */
  async completeProcess(): Promise<void> {
    await this.clickButton('İşlemi Tamamla');
    await this.waitForSpinner();
  }

  /**
   * Başarı mesajını doğrula
   */
  async verifySuccessMessage(): Promise<void> {
    await this.verifyVisible(this.selectors.successMessage);
  }
}
