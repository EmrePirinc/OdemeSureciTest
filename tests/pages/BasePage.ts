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
}
