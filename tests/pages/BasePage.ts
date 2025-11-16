import { Page, Locator, expect } from '@playwright/test';

/**
 * Waits for the page to be in a network idle state.
 * @param page The Playwright page object.
 */
export const waitForNetworkIdle = async (page: Page) => {
  await page.waitForLoadState('networkidle');
};

/**
 * Waits for a spinner element to disappear.
 * @param page The Playwright page object.
 */
export const waitForSpinner = async (page: Page) => {
  const spinner = page.locator('.spinner, .loader, [aria-busy="true"]');
  await expect(spinner).toBeHidden({ timeout: 15000 });
};

/**
 * BasePage - A base class for all page objects.
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to the specified URL.
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await waitForNetworkIdle(this.page);
  }

  /**
   * Clicks a button and waits for navigation or a spinner to resolve.
   */
  async clickButton(buttonText: string): Promise<void> {
    const button = this.page.locator(`button:has-text("${buttonText}")`);
    await button.waitFor({ state: 'visible' });

    // Use Promise.race to handle both navigation and spinners
    await Promise.race([
      this.page.waitForNavigation({ waitUntil: 'networkidle' }),
      button.click().then(() => waitForSpinner(this.page))
    ]);
  }

  /**
   * Uploads a file and waits for a response or a success message.
   */
  async uploadFile(selector: string, filePath: string): Promise<void> {
    const [response] = await Promise.all([
      this.page.waitForResponse(resp => resp.status() === 200), // Adjust URL/status as needed
      this.page.locator(selector).setInputFiles(filePath)
    ]);
    expect(response.ok()).toBe(true);
  }

  // ... other methods from the original BasePage ...
  // Ensure that other methods using waits are also updated.

  /**
   * Downloads a file and returns its suggested filename.
   */
  async downloadFile(buttonSelector: string): Promise<string> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.locator(buttonSelector).click(),
    ]);
    return download.suggestedFilename();
  }

  /**
   * Wait for specified milliseconds
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Get locator for selector
   */
  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Fill input field
   */
  async fillInput(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).fill(value);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, index: number): Promise<void> {
    await this.page.locator(selector).selectOption({ index });
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string, timeout: number = 2000): Promise<boolean> {
    return this.page.locator(selector).isVisible({ timeout }).catch(() => false);
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(selector: string): Promise<boolean> {
    return this.page.locator(selector).isEnabled();
  }

  /**
   * Get attribute value
   */
  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    return this.page.locator(selector).getAttribute(attribute);
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string, fullPage: boolean = false): Promise<void> {
    await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage
    });
  }

  /**
   * Verify element is visible
   */
  async verifyVisible(selector: string, timeout: number = 10000): Promise<void> {
    await expect(this.page.locator(selector).first()).toBeVisible({ timeout });
  }

  /**
   * Verify text content
   */
  async verifyText(selector: string, text: string | RegExp, timeout: number = 10000): Promise<void> {
    await expect(this.page.locator(selector).first()).toHaveText(text, { timeout });
  }

  /**
   * Verify element is enabled
   */
  async verifyEnabled(selector: string, timeout: number = 10000): Promise<void> {
    await expect(this.page.locator(selector).first()).toBeEnabled({ timeout });
  }

  /**
   * Wait for selector to be visible
   */
  async waitForSelector(selector: string, timeout: number = 10000): Promise<void> {
    await this.page.locator(selector).first().waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for spinner/loader to disappear
   */
  async waitForSpinner(): Promise<void> {
    await waitForSpinner(this.page);
  }

  /**
   * Check if element is visible within a specific row
   */
  async isVisibleInRow(rowLocator: Locator, selector: string): Promise<boolean> {
    return rowLocator.locator(selector).isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Check if element is enabled within a specific row
   */
  async isEnabledInRow(rowLocator: Locator, selector: string): Promise<boolean> {
    return rowLocator.locator(selector).isEnabled().catch(() => false);
  }

  /**
   * Verify element is disabled
   */
  async verifyDisabled(selector: string, timeout: number = 10000): Promise<void> {
    await expect(this.page.locator(selector).first()).toBeDisabled({ timeout });
  }
}
