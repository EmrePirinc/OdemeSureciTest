import { Page } from '@playwright/test';
import * as path from 'path';

/**
 * Screenshot helper - otomatik isim üretir
 * @param page - Playwright Page objesi
 * @param testName - Test adı
 * @param description - Açıklama (opsiyonel)
 */
export async function takeScreenshot(
  page: Page,
  testName: string,
  description?: string
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = description
    ? `${testName}-${description}-${timestamp}.png`
    : `${testName}-${timestamp}.png`;

  const screenshotPath = path.join('screenshots', fileName);

  await page.screenshot({ path: screenshotPath, fullPage: true });

  return screenshotPath;
}

/**
 * Element screenshot - belirli bir elementi fotoğraflar
 * @param page - Playwright Page objesi
 * @param selector - Element selector
 * @param fileName - Dosya adı
 */
export async function takeElementScreenshot(
  page: Page,
  selector: string,
  fileName: string
) {
  const element = page.locator(selector).first();

  if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
    const screenshotPath = path.join('screenshots', fileName);
    await element.screenshot({ path: screenshotPath });
    return screenshotPath;
  }

  return null;
}

/**
 * Karşılaştırma için screenshot al
 * @param page - Playwright Page objesi
 * @param baselineName - Baseline dosya adı
 */
export async function takeComparisonScreenshot(
  page: Page,
  baselineName: string
) {
  const screenshotPath = path.join('screenshots', 'baselines', `${baselineName}.png`);

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  return screenshotPath;
}
