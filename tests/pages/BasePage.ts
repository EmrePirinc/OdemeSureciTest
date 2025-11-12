import { Page, Locator, expect } from '@playwright/test';
import { waitForSpinner, waitForNetworkIdle } from '../helpers/wait.helper';

/**
 * BasePage - Tüm sayfalar için temel sınıf
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Sayfaya git
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Network idle bekle - timeout olursa devam et
    await waitForNetworkIdle(this.page).catch(() => {
      console.warn('⚠️ Network idle timeout - devam ediliyor');
    });

    // Spinner bekle - yoksa devam et
    await waitForSpinner(this.page).catch(() => {
      // Spinner yoksa sorun yok
    });
  }

  /**
   * Sayfa yenile
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await waitForNetworkIdle(this.page);
  }

  /**
   * Element bul
   */
  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Butona tıkla (text ile)
   */
  async clickButton(buttonText: string): Promise<void> {
    const button = this.page.locator(`button:has-text("${buttonText}")`);
    await button.waitFor({ state: 'visible' });
    await button.click();
    await waitForSpinner(this.page);
  }

  /**
   * Link'e tıkla
   */
  async clickLink(linkText: string): Promise<void> {
    const link = this.page.locator(`a:has-text("${linkText}")`);
    await link.click();
    await waitForNetworkIdle(this.page);
  }

  /**
   * Input alanını doldur
   */
  async fillInput(selector: string, value: string): Promise<void> {
    const input = this.page.locator(selector);
    await input.waitFor({ state: 'visible' });
    await input.clear();
    await input.fill(value);
  }

  /**
   * Dropdown'dan seç
   */
  async selectOption(selector: string, value: string | number): Promise<void> {
    const select = this.page.locator(selector);
    await select.waitFor({ state: 'visible' });

    if (typeof value === 'number') {
      await select.selectOption({ index: value });
    } else {
      await select.selectOption({ value });
    }
  }

  /**
   * Checkbox/Radio işaretle
   */
  async check(selector: string): Promise<void> {
    const checkbox = this.page.locator(selector);
    await checkbox.check();
  }

  /**
   * Checkbox/Radio işareti kaldır
   */
  async uncheck(selector: string): Promise<void> {
    const checkbox = this.page.locator(selector);
    await checkbox.uncheck();
  }

  /**
   * Element görünür mü kontrol et
   */
  async isVisible(selector: string): Promise<boolean> {
    return this.page.locator(selector).isVisible({ timeout: 5000 }).catch(() => false);
  }

  /**
   * Element enabled mı kontrol et
   */
  async isEnabled(selector: string): Promise<boolean> {
    return this.page.locator(selector).isEnabled().catch(() => false);
  }

  /**
   * Element disabled mı kontrol et
   */
  async isDisabled(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    return element.isDisabled().catch(() => true);
  }

  /**
   * Text al
   */
  async getText(selector: string): Promise<string | null> {
    return this.page.locator(selector).textContent();
  }

  /**
   * Value al (input alanları için)
   */
  async getValue(selector: string): Promise<string> {
    return this.page.locator(selector).inputValue();
  }

  /**
   * Attribute değeri al
   */
  async getAttribute(selector: string, attributeName: string): Promise<string | null> {
    return this.page.locator(selector).getAttribute(attributeName);
  }

  /**
   * Element sayısı al
   */
  async getCount(selector: string): Promise<number> {
    return this.page.locator(selector).count();
  }

  /**
   * Toast/Alert mesajı al
   */
  async getToastMessage(): Promise<string | null> {
    const toastSelectors = [
      '.toast',
      '.alert',
      '[role="alert"]',
      '.notification',
      '.message',
    ];

    for (const selector of toastSelectors) {
      const toast = this.page.locator(selector).first();

      if (await toast.isVisible({ timeout: 2000 }).catch(() => false)) {
        return toast.textContent();
      }
    }

    return null;
  }

  /**
   * Hata mesajı var mı kontrol et
   */
  async hasError(): Promise<boolean> {
    const errorSelectors = [
      '.error-message',
      '.error-toast',
      '[role="alert"]',
      '.alert-error',
    ];

    for (const selector of errorSelectors) {
      if (await this.isVisible(selector)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Screenshot al
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Element'e scroll yap
   */
  async scrollToElement(selector: string): Promise<void> {
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * Sayfanın en altına scroll yap
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  /**
   * Sayfanın en üstüne scroll yap
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  /**
   * Bekleme (gerektiğinde kullan)
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /**
   * URL doğrula
   */
  async verifyURL(expectedURL: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(expectedURL);
  }

  /**
   * Element görünür mü doğrula
   */
  async verifyVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  /**
   * Element gizli mi doğrula
   */
  async verifyHidden(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  /**
   * Text doğrula
   */
  async verifyText(selector: string, expectedText: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveText(expectedText);
  }

  /**
   * Text içeriyor mu doğrula
   */
  async verifyContainsText(selector: string, expectedText: string): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(expectedText);
  }

  /**
   * Element enabled doğrula
   */
  async verifyEnabled(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeEnabled();
  }

  /**
   * Element disabled doğrula
   */
  async verifyDisabled(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeDisabled();
  }

  /**
   * Tablo satır sayısını al
   */
  async getTableRowCount(tableSelector: string = 'table'): Promise<number> {
    return this.getCount(`${tableSelector} tbody tr`);
  }

  /**
   * Tablo hücresinin değerini al
   */
  async getTableCellValue(
    rowIndex: number,
    columnIndex: number,
    tableSelector: string = 'table'
  ): Promise<string | null> {
    const cell = this.page.locator(
      `${tableSelector} tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${columnIndex + 1})`
    );
    return cell.textContent();
  }

  /**
   * Dosya yükle
   */
  async uploadFile(selector: string, filePath: string): Promise<void> {
    const input = this.page.locator(selector);
    await input.setInputFiles(filePath);
  }

  /**
   * Dosya indir (download event'i yakalama)
   */
  async downloadFile(buttonSelector: string): Promise<string> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.locator(buttonSelector).click(),
    ]);

    return download.suggestedFilename();
  }
}
