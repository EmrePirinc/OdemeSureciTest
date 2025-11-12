import { Page, Locator } from '@playwright/test';

/**
 * Spinner'ın kaybolmasını bekle
 */
export async function waitForSpinner(page: Page, timeout: number = 10000): Promise<void> {
  const spinnerSelectors = [
    '.spinner',
    '.loading',
    '[data-testid="spinner"]',
    '.loader',
    '[class*="spin"]',
  ];

  for (const selector of spinnerSelectors) {
    const spinner = page.locator(selector).first();

    if (await spinner.isVisible({ timeout: 1000 }).catch(() => false)) {
      await spinner.waitFor({ state: 'hidden', timeout });
      return;
    }
  }
}

/**
 * Toast/Alert mesajının görünmesini bekle
 */
export async function waitForToast(page: Page, timeout: number = 5000): Promise<Locator> {
  const toastSelectors = [
    '.toast',
    '.alert',
    '[role="alert"]',
    '.notification',
    '.message',
  ];

  for (const selector of toastSelectors) {
    const toast = page.locator(selector).first();

    if (await toast.isVisible({ timeout: 1000 }).catch(() => false)) {
      return toast;
    }
  }

  throw new Error('Toast mesajı bulunamadı');
}

/**
 * Network idle durumunu bekle
 */
export async function waitForNetworkIdle(page: Page, timeout: number = 10000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Belirli bir elementin görünmesini bekle
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<Locator> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });
  return element;
}

/**
 * Elementin kaybolmasını bekle
 */
export async function waitForElementToDisappear(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<void> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'hidden', timeout }).catch(() => {
    // Element zaten yoksa hata verme
  });
}

/**
 * Tablo satırlarının yüklenmesini bekle
 */
export async function waitForTableRows(
  page: Page,
  tableSelector: string = 'table',
  minRows: number = 1,
  timeout: number = 10000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const rows = await page.locator(`${tableSelector} tbody tr`).count();

    if (rows >= minRows) {
      return;
    }

    await page.waitForTimeout(500);
  }

  throw new Error(`Tablo satırları ${timeout}ms içinde yüklenmedi`);
}

/**
 * API yanıtını bekle
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 10000
): Promise<any> {
  const response = await page.waitForResponse(
    (resp) => {
      const url = resp.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );

  return response.json();
}

/**
 * Butona tıklandıktan sonra network isteğini bekle
 */
export async function clickAndWaitForRequest(
  page: Page,
  buttonSelector: string,
  urlPattern: string | RegExp
): Promise<void> {
  const [request] = await Promise.all([
    page.waitForRequest((req) => {
      const url = req.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    }),
    page.locator(buttonSelector).click(),
  ]);

  console.log(`✅ Request gönderildi: ${request.url()}`);
}

/**
 * Belirli bir süre bekle (sadece gerektiğinde kullan)
 */
export async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Elementin enabled olmasını bekle
 */
export async function waitForElementEnabled(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<void> {
  const element = page.locator(selector);
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await element.isEnabled()) {
      return;
    }
    await wait(100);
  }

  throw new Error(`Element ${timeout}ms içinde enabled olmadı: ${selector}`);
}

/**
 * Text içeriğinin değişmesini bekle
 */
export async function waitForTextChange(
  page: Page,
  selector: string,
  initialText: string,
  timeout: number = 5000
): Promise<string> {
  const element = page.locator(selector);
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const currentText = await element.textContent();

    if (currentText && currentText !== initialText) {
      return currentText;
    }

    await wait(100);
  }

  throw new Error(`Text ${timeout}ms içinde değişmedi: ${selector}`);
}
