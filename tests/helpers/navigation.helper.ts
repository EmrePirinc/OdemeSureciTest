import { Page, expect } from '@playwright/test';

/**
 * Görev listesine git
 */
export async function goToTaskList(page: Page): Promise<void> {
  await page.goto('/payment/tasks');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/payment\/tasks/);
}

/**
 * Belirli bir sürece git (processId ile)
 */
export async function goToProcess(page: Page, processId: string): Promise<void> {
  await page.goto(`/payment/invoices/${processId}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Özet sayfasına git
 */
export async function goToSummary(page: Page, processId: string): Promise<void> {
  await page.goto(`/payment/summary/${processId}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Talimat sayfasına git (Stage 6)
 */
export async function goToInstruction(page: Page, processId: string): Promise<void> {
  await page.goto(`/payment/instruction/${processId}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Tamamlanan süreç sayfasına git
 */
export async function goToCompletedProcess(page: Page, processId: string): Promise<void> {
  await page.goto(`/payment/completed/${processId}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Sayfa URL'inin doğru olduğunu kontrol et
 */
export async function verifyURL(page: Page, expectedPath: string | RegExp): Promise<void> {
  if (typeof expectedPath === 'string') {
    await expect(page).toHaveURL(new RegExp(expectedPath));
  } else {
    await expect(page).toHaveURL(expectedPath);
  }
}

/**
 * Sayfa başlığını kontrol et
 */
export async function verifyPageTitle(page: Page, expectedTitle: string): Promise<void> {
  const title = page.locator('h1, h2').first();
  await expect(title).toContainText(expectedTitle);
}

/**
 * Geri butonu ile önceki sayfaya dön
 */
export async function goBack(page: Page): Promise<void> {
  await page.goBack();
  await page.waitForLoadState('networkidle');
}

/**
 * Sayfa yenile
 */
export async function refresh(page: Page): Promise<void> {
  await page.reload();
  await page.waitForLoadState('networkidle');
}

/**
 * Belirli bir elemente scroll yap
 */
export async function scrollToElement(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector);
  await element.scrollIntoViewIfNeeded();
}

/**
 * Sayfanın en altına scroll yap
 */
export async function scrollToBottom(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
}

/**
 * Sayfanın en üstüne scroll yap
 */
export async function scrollToTop(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, 0));
}
