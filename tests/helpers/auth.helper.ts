import { Page, expect } from '@playwright/test';
import { TEST_USERS, TestUser, COMPANY_OPTIONS } from '../data/users';

/**
 * Login helper - Gelişmiş login fonksiyonu
 * @param page - Playwright Page objesi
 * @param user - TestUser objesi veya kullanıcı adı
 * @param companyIndex - Şirket dropdown index (default: 1)
 */
export async function login(
  page: Page,
  user: TestUser | string,
  companyIndex: number = COMPANY_OPTIONS.DEFAULT.index
): Promise<void> {
  // String ise kullanıcı adından TestUser objesi bul
  const testUser = typeof user === 'string'
    ? Object.values(TEST_USERS).find(u => u.username === user)
    : user;

  if (!testUser) {
    throw new Error(`Kullanıcı bulunamadı: ${user}`);
  }

  console.log(`🔐 Login: ${testUser.role} (${testUser.username})`);

  // Login sayfasına git
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Form elemanlarını bul
  const companySelect = page.locator('select').first();
  const usernameInput = page.locator('input[type="text"]');
  const passwordInput = page.locator('input[type="password"]');
  const loginButton = page.locator('button:has-text("Giriş Yap")');

  // Şirket seç
  await companySelect.selectOption({ index: companyIndex });
  await page.waitForTimeout(500);

  // Kullanıcı bilgilerini gir
  await usernameInput.fill(testUser.username);
  await page.waitForTimeout(300);
  await passwordInput.fill(testUser.password);
  await page.waitForTimeout(300);

  // Giriş butonunun aktif olduğundan emin ol
  await loginButton.waitFor({ state: 'visible', timeout: 5000 });

  // Giriş yap - navigation beklentisi ile
  await Promise.all([
    page.waitForNavigation({ timeout: 20000, waitUntil: 'domcontentloaded' }).catch(() => {}),
    loginButton.click()
  ]);

  // Sayfanın yüklenmesini bekle
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);

  // Artık login sayfasında olmadığımızı kontrol et
  const currentURL = page.url();
  if (currentURL.includes('/login') || currentURL.includes('/giris')) {
    // Hata mesajı var mı kontrol et
    const errorMsg = await page.locator('.error, .alert-danger, [class*="error"]').first().textContent().catch(() => null);
    throw new Error(`Login başarısız - hala login sayfasında: ${currentURL}${errorMsg ? `, Hata: ${errorMsg}` : ''}`);
  }

  console.log(`✅ Login başarılı: ${testUser.role} → ${currentURL}`);
}

/**
 * Hızlı login - Sadece kullanıcı adı ile
 */
export async function quickLogin(page: Page, username: string): Promise<void> {
  const user = Object.values(TEST_USERS).find(u => u.username === username);
  if (!user) {
    throw new Error(`Kullanıcı bulunamadı: ${username}`);
  }
  await login(page, user);
}

/**
 * Rol bazlı login
 */
export async function loginByRole(page: Page, role: string): Promise<void> {
  const user = Object.values(TEST_USERS).find(u => u.role === role);
  if (!user) {
    throw new Error(`Rol bulunamadı: ${role}`);
  }
  await login(page, user);
}

/**
 * Logout fonksiyonu
 * @param page - Playwright Page objesi
 */
export async function logout(page: Page): Promise<boolean> {
  console.log('🚪 Logout yapılıyor...');

  // Kullanıcı menüsünü veya logout butonunu bul
  const logoutSelectors = [
    'button:has-text("Çıkış")',
    'a:has-text("Çıkış")',
    'button:has-text("Logout")',
    'a:has-text("Logout")',
    '[data-testid="logout"]',
    'button[aria-label*="Çıkış"]',
  ];

  for (const selector of logoutSelectors) {
    const logoutButton = page.locator(selector).first();

    if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutButton.click();
      await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {});

      if (page.url().includes('/login')) {
        console.log('✅ Logout başarılı');
        return true;
      }
    }
  }

  // Logout butonu bulunamadı, direkt login sayfasına git
  console.log('⚠️ Logout butonu bulunamadı, direkt login sayfasına gidiliyor');
  await page.goto('/login');
  return true;
}

/**
 * Login durumu kontrolü
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const url = page.url();

  // Login sayfasındaysa giriş yapılmamış
  if (url.includes('/login')) {
    return false;
  }

  // Navigasyon veya görev listesi varsa giriş yapılmış
  const indicators = [
    page.locator('nav').first(),
    page.locator('[data-testid="user-menu"]').first(),
    page.locator('text=Görev Listesi').first(),
  ];

  for (const indicator of indicators) {
    if (await indicator.isVisible({ timeout: 2000 }).catch(() => false)) {
      return true;
    }
  }

  return false;
}

/**
 * Login hata mesajı kontrolü
 */
export async function getLoginError(page: Page): Promise<string | null> {
  const errorSelectors = [
    '.error-message',
    '.error-toast',
    '[role="alert"]',
    '.alert-error',
    'text=/hata|error/i',
  ];

  for (const selector of errorSelectors) {
    const errorElement = page.locator(selector).first();

    if (await errorElement.isVisible({ timeout: 1000 }).catch(() => false)) {
      return await errorElement.textContent();
    }
  }

  return null;
}

/**
 * Test kullanıcı bilgisini al
 */
export function getTestUser(identifier: string): TestUser {
  // Önce username ile ara
  let user = Object.values(TEST_USERS).find(u => u.username === identifier);

  // Bulunamazsa role ile ara
  if (!user) {
    user = Object.values(TEST_USERS).find(u => u.role === identifier);
  }

  // Hala bulunamadıysa key ile ara
  if (!user) {
    user = TEST_USERS[identifier as keyof typeof TEST_USERS];
  }

  if (!user) {
    throw new Error(`Test kullanıcısı bulunamadı: ${identifier}`);
  }

  return user;
}
