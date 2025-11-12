import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Stage2Page - Stage 2 (Bölüm Müdürü Onayı) sayfası için Page Object
 * İç Piyasa ve Dış Piyasa Müdürleri tarafından kullanılır
 */
export class Stage2Page extends BasePage {
  // Selectors
  private readonly selectors = {
    // Görev Listesi
    taskListTable: 'table',
    taskListRow: 'table tbody tr',
    taskListItem: (taskName: string) => `text=${taskName}`,

    // Butonlar
    approveButton: 'button:has-text("Onayla")',
    rejectButton: 'button:has-text("Geri Ata"), button:has-text("Reddet")',

    // Onay/Reddetme Modalı
    rejectionReasonInput: 'textarea[name="rejectionReason"]',
    confirmRejectionButton: 'button:has-text("Geri Gönder"), button:has-text("Onayla")',

    // Genel
    pageTitle: 'h1:has-text("Görev Listesi")',
    successMessage: '.alert-success',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Görev listesi sayfasının yüklendiğini doğrula
   */
  async verifyOnPage(): Promise<void> {
    await this.verifyVisible(this.selectors.pageTitle);
    await this.verifyVisible(this.selectors.taskListTable);
  }

  /**
   * Belirli bir görevi onayla
   * @param taskIdentifier Görevi tanımlayan metin (örn: fatura no, talep ID)
   */
  async approveTask(taskIdentifier: string): Promise<void> {
    const taskRow = this.page.locator(this.selectors.taskListRow, { hasText: taskIdentifier });
    await taskRow.locator(this.selectors.approveButton).click();
    await this.waitForSpinner();
  }

  /**
   * Görevin onay butonunun görünür olup olmadığını kontrol et
   */
  async isApproveButtonVisible(taskIdentifier: string): Promise<boolean> {
    const taskRow = this.page.locator(this.selectors.taskListRow, { hasText: taskIdentifier });
    return this.isVisibleInRow(taskRow, this.selectors.approveButton);
  }

  /**
   * Görevin reddet butonunun etkin olup olmadığını kontrol et
   */
  async isRejectButtonEnabled(taskIdentifier: string): Promise<boolean> {
    const taskRow = this.page.locator(this.selectors.taskListRow, { hasText: taskIdentifier });
    return this.isEnabledInRow(taskRow, this.selectors.rejectButton);
  }

  /**
   * Başarı mesajının göründüğünü doğrula
   */
  async verifySuccessMessage(): Promise<void> {
    await this.verifyVisible(this.selectors.successMessage);
  }
}
