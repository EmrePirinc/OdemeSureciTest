import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Stage3Page - Stage 3 (Finans Onayı ve Ekstre Yükleme) sayfası için Page Object
 * Finans Kullanıcısı tarafından kullanılır
 */
export class Stage3Page extends BasePage {
  // Selectors
  private readonly selectors = {
    // Görev Listesi
    taskListTable: 'table',
    taskListItem: (taskName: string) => `text=${taskName}`,

    // Form Elemanları
    fileUploadInput: 'input[type="file"]',
    approveButton: 'button:has-text("Onayla")',
    rejectButton: 'button:has-text("Geri Ata")', // This might not be available in Stage 3

    // Hata Mesajları
    validationError: '.validation-error',
    uploadSuccessMessage: 'text=Dosya başarıyla yüklendi',

    // Genel
    pageTitle: 'h1:has-text("Görev Detayları")', // Assuming user clicks a task and navigates to its details
    successMessage: '.alert-success',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Görev detay sayfasına git (simüle) ve sayfanın yüklendiğini doğrula
   */
  async navigateToTask(taskId: string): Promise<void> {
    // In a real app, you would click the task in the list.
    // For isolated testing, we can navigate directly if the URL is predictable.
    await this.goto(`/payment/task/${taskId}`);
    await this.verifyVisible(this.selectors.pageTitle);
  }

  /**
   * Ekstre dosyası yükle
   * @param filePath Yüklenecek dosyanın yolu
   */
  async uploadStatement(filePath: string): Promise<void> {
    await this.uploadFile(this.selectors.fileUploadInput, filePath);
    // Wait for a confirmation of the upload. This might be a specific element.
    await this.verifyVisible(this.selectors.uploadSuccessMessage);
  }

  /**
   * Onayla butonuna tıkla
   */
  async clickApprove(): Promise<void> {
    await this.clickButton('Onayla');
    await this.waitForSpinner();
  }

  /**
   * Onayla butonunun etkin olup olmadığını kontrol et
   */
  async isApproveButtonEnabled(): Promise<boolean> {
    return this.isEnabled(this.selectors.approveButton);
  }

  /**
   * Form doğrulama hatası olup olmadığını kontrol et
   */
  async hasValidationError(): Promise<boolean> {
    return this.isVisible(this.selectors.validationError);
  }

  /**
   * Başarı mesajını doğrula
   */
  async verifySuccessMessage(): Promise<void> {
    await this.verifyVisible(this.selectors.successMessage);
  }
}
