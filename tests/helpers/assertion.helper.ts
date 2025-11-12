import { Page, expect, Locator } from '@playwright/test';

/**
 * Elementin görünür olduğunu doğrula
 */
export async function assertVisible(
  element: Locator | Page,
  selector?: string
): Promise<void> {
  const target = selector ? (element as Page).locator(selector) : (element as Locator);
  await expect(target).toBeVisible();
}

/**
 * Elementin gizli olduğunu doğrula
 */
export async function assertHidden(
  element: Locator | Page,
  selector?: string
): Promise<void> {
  const target = selector ? (element as Page).locator(selector) : (element as Locator);
  await expect(target).toBeHidden();
}

/**
 * Elementin enabled olduğunu doğrula
 */
export async function assertEnabled(
  element: Locator | Page,
  selector?: string
): Promise<void> {
  const target = selector ? (element as Page).locator(selector) : (element as Locator);
  await expect(target).toBeEnabled();
}

/**
 * Elementin disabled olduğunu doğrula
 */
export async function assertDisabled(
  element: Locator | Page,
  selector?: string
): Promise<void> {
  const target = selector ? (element as Page).locator(selector) : (element as Locator);
  await expect(target).toBeDisabled();
}

/**
 * Elementin read-only olduğunu doğrula (özellikle Stage 6 için)
 */
export async function assertReadOnly(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector);

  // Input elementiyse readonly attribute kontrol et
  const tagName = await element.evaluate((el) => el.tagName.toLowerCase());

  if (tagName === 'input' || tagName === 'textarea') {
    const isReadonly = await element.evaluate((el) =>
      el.hasAttribute('readonly') || el.hasAttribute('disabled')
    );
    expect(isReadonly).toBeTruthy();
  } else {
    // Diğer elementlerde disabled kontrol et
    await expect(element).toBeDisabled();
  }
}

/**
 * Text içeriğini doğrula
 */
export async function assertText(
  element: Locator | Page,
  expectedText: string,
  selector?: string
): Promise<void> {
  const target = selector ? (element as Page).locator(selector) : (element as Locator);
  await expect(target).toHaveText(expectedText);
}

/**
 * Text içerdiğini doğrula (kısmi)
 */
export async function assertContainsText(
  element: Locator | Page,
  expectedText: string,
  selector?: string
): Promise<void> {
  const target = selector ? (element as Page).locator(selector) : (element as Locator);
  await expect(target).toContainText(expectedText);
}

/**
 * Value'yu doğrula (input alanları için)
 */
export async function assertValue(
  element: Locator | Page,
  expectedValue: string,
  selector?: string
): Promise<void> {
  const target = selector ? (element as Page).locator(selector) : (element as Locator);
  await expect(target).toHaveValue(expectedValue);
}

/**
 * Attribute değerini doğrula
 */
export async function assertAttribute(
  element: Locator | Page,
  attributeName: string,
  expectedValue: string,
  selector?: string
): Promise<void> {
  const target = selector ? (element as Page).locator(selector) : (element as Locator);
  await expect(target).toHaveAttribute(attributeName, expectedValue);
}

/**
 * Element sayısını doğrula
 */
export async function assertCount(
  element: Locator | Page,
  expectedCount: number,
  selector?: string
): Promise<void> {
  const target = selector ? (element as Page).locator(selector) : (element as Locator);
  await expect(target).toHaveCount(expectedCount);
}

/**
 * URL'yi doğrula
 */
export async function assertURL(
  page: Page,
  expectedURL: string | RegExp
): Promise<void> {
  await expect(page).toHaveURL(expectedURL);
}

/**
 * Sayfa başlığını doğrula
 */
export async function assertTitle(page: Page, expectedTitle: string | RegExp): Promise<void> {
  await expect(page).toHaveTitle(expectedTitle);
}

/**
 * Hata mesajı görünmediğini doğrula
 */
export async function assertNoErrors(page: Page): Promise<void> {
  const errorSelectors = [
    '.error-message',
    '.error-toast',
    '[role="alert"]',
    '.alert-error',
  ];

  for (const selector of errorSelectors) {
    const errorElement = page.locator(selector);
    if (await errorElement.count() > 0) {
      await expect(errorElement).toBeHidden();
    }
  }
}

/**
 * Tablo satır sayısını doğrula
 */
export async function assertTableRowCount(
  page: Page,
  expectedCount: number,
  tableSelector: string = 'table'
): Promise<void> {
  const rows = page.locator(`${tableSelector} tbody tr`);
  await expect(rows).toHaveCount(expectedCount);
}

/**
 * Tablo hücresinin değerini doğrula
 */
export async function assertTableCellValue(
  page: Page,
  rowIndex: number,
  columnIndex: number,
  expectedValue: string,
  tableSelector: string = 'table'
): Promise<void> {
  const cell = page.locator(
    `${tableSelector} tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${columnIndex + 1})`
  );
  await expect(cell).toContainText(expectedValue);
}

/**
 * Dropdown seçeneğini doğrula
 */
export async function assertSelectedOption(
  page: Page,
  selector: string,
  expectedValue: string
): Promise<void> {
  const select = page.locator(selector);
  await expect(select).toHaveValue(expectedValue);
}

/**
 * Checkbox/Radio işaretli mi doğrula
 */
export async function assertChecked(
  element: Locator | Page,
  selector?: string
): Promise<void> {
  const target = selector ? (element as Page).locator(selector) : (element as Locator);
  await expect(target).toBeChecked();
}

/**
 * Checkbox/Radio işaretsiz mi doğrula
 */
export async function assertNotChecked(
  element: Locator | Page,
  selector?: string
): Promise<void> {
  const target = selector ? (element as Page).locator(selector) : (element as Locator);
  await expect(target).not.toBeChecked();
}

/**
 * Toast/Alert mesajını doğrula
 */
export async function assertToastMessage(
  page: Page,
  expectedMessage: string
): Promise<void> {
  const toast = page.locator('.toast, .alert, [role="alert"]').first();
  await expect(toast).toBeVisible();
  await expect(toast).toContainText(expectedMessage);
}

/**
 * Butonun aktif olduğunu doğrula
 */
export async function assertButtonEnabled(
  page: Page,
  buttonText: string
): Promise<void> {
  const button = page.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeEnabled();
}

/**
 * Butonun inaktif olduğunu doğrula
 */
export async function assertButtonDisabled(
  page: Page,
  buttonText: string
): Promise<void> {
  const button = page.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeDisabled();
}

/**
 * Form validasyon hatası doğrula
 */
export async function assertValidationError(
  page: Page,
  fieldSelector: string,
  expectedError?: string
): Promise<void> {
  const errorElement = page.locator(`${fieldSelector} ~ .error, ${fieldSelector} + .error`);
  await expect(errorElement).toBeVisible();

  if (expectedError) {
    await expect(errorElement).toContainText(expectedError);
  }
}
