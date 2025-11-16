import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CompletedProcessesPage - Tamamlanmış Süreçler sayfası için Page Object
 */
export class CompletedProcessesPage extends BasePage {
  // Selectors
  private readonly selectors = {
    pageTitle: 'h1:has-text("Tamamlanmış Süreçler")',
    searchFilter: 'input[placeholder="Ara..."]',
    dateFilter: 'input[type="date"]',
    resultsTable: 'table',
    tableRow: 'tbody tr',
    noResultsMessage: 'text=Hiçbir sonuç bulunamadı',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Sayfaya git ve yüklendiğini doğrula
   */
  async navigate(): Promise<void> {
    await this.goto('/payment/completed');
    await this.verifyVisible(this.selectors.pageTitle);
  }

  /**
   * Belirli bir süreci ara
   * @param searchTerm Aranacak metin (örn: talep ID)
   */
  async searchForProcess(searchTerm: string): Promise<void> {
    await this.fillInput(this.selectors.searchFilter, searchTerm);
    await this.page.press(this.selectors.searchFilter, 'Enter');
    await this.waitForSpinner();
  }

  /**
   * Arama sonucunda en az bir sonuç olduğunu doğrula
   */
  async verifyProcessIsListed(): Promise<void> {
    const rowCount = await this.page.locator(this.selectors.tableRow).count();
    expect(rowCount).toBeGreaterThan(0);
  }

  /**
   * Arama sonucunda hiçbir sonuç olmadığını doğrula
   */
  async verifyProcessIsNotListed(): Promise<void> {
    await this.verifyVisible(this.selectors.noResultsMessage);
  }
}
