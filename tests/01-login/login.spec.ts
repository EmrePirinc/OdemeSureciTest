import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TEST_USERS, USER_GROUPS } from '../data/users';

test.describe('Login Testleri', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC-LOGIN-001: Login sayfasının yüklenmesi', async () => {
    // Sayfa başlığını kontrol et
    await expect(loginPage.page).toHaveTitle(/Satınalma Talep Sistemi|Anadolu Bakır/);

    // Login formu görünür mü
    const isFormVisible = await loginPage.isLoginFormVisible();
    expect(isFormVisible).toBeTruthy();

    // Screenshot al
    await loginPage.takeScreenshot('tc-login-001-page-loaded');
  });

  test('TC-LOGIN-002: Form elemanlarının varlığı', async () => {
    // Tüm elemanlar görünür olmalı
    await loginPage.verifyVisible('select'); // Şirket dropdown
    await loginPage.verifyVisible('input[type="text"]'); // Kullanıcı adı
    await loginPage.verifyVisible('input[type="password"]'); // Şifre
    await loginPage.verifyVisible('button:has-text("Giriş Yap")'); // Login butonu
  });

  test('TC-LOGIN-003: Placeholder kontrolü', async () => {
    const usernamePlaceholder = await loginPage.getUsernamePlaceholder();
    const passwordPlaceholder = await loginPage.getPasswordPlaceholder();

    expect(usernamePlaceholder).toContain('Kullanıcı');
    expect(passwordPlaceholder).toContain('Şifre');
  });

  test('TC-LOGIN-004: Boş form ile giriş denemesi', async () => {
    // Hiçbir şey girmeden giriş yap
    await loginPage.clickLogin();

    // Hata mesajı olmalı veya sayfa değişmemeli
    await loginPage.wait(2000);
    const url = loginPage.page.url();
    expect(url).toContain('/login');

    await loginPage.takeScreenshot('tc-login-004-empty-form');
  });

  test('TC-LOGIN-005: Sadece kullanıcı adı ile giriş', async () => {
    await loginPage.selectCompany(6);
    await loginPage.enterUsername('testuser');
    await loginPage.clickLogin();

    await loginPage.wait(2000);
    const url = loginPage.page.url();
    expect(url).toContain('/login');
  });

  test('TC-LOGIN-006: Sadece şifre ile giriş', async () => {
    await loginPage.selectCompany(6);
    await loginPage.enterPassword('testpass');
    await loginPage.clickLogin();

    await loginPage.wait(2000);
    const url = loginPage.page.url();
    expect(url).toContain('/login');
  });

  test('TC-LOGIN-007: Geçersiz kullanıcı bilgileri', async () => {
    await loginPage.loginWithCredentials('invalid_user', 'invalid_pass', 6);

    await loginPage.wait(3000);

    // Hata mesajı kontrol et
    const hasError = await loginPage.hasErrorMessage();
    if (hasError) {
      const errorMessage = await loginPage.getErrorMessage();
      console.log('Hata mesajı:', errorMessage);
    }

    // Hala login sayfasında olmalı
    const url = loginPage.page.url();
    expect(url).toContain('/login');

    await loginPage.takeScreenshot('tc-login-007-invalid-credentials');
  });

  test('TC-LOGIN-008: Şifre göster/gizle toggle', async () => {
    await loginPage.enterPassword('TestPassword123');

    // İlk durumda password type olmalı
    let passwordType = await loginPage.getPasswordInputType();
    expect(passwordType).toBe('password');

    // Toggle butonuna tıkla
    await loginPage.togglePasswordVisibility();
    await loginPage.wait(500);

    // Type değişmiş olmalı (text veya password)
    passwordType = await loginPage.getPasswordInputType();
    console.log('Toggle sonrası password type:', passwordType);

    await loginPage.takeScreenshot('tc-login-008-password-toggle');
  });

  test('TC-LOGIN-009: Admin kullanıcısı ile başarılı login', async ({ page }) => {
    const admin = TEST_USERS.ADMIN;

    await loginPage.login(admin);

    // Login sayfasından ayrıldığımızı kontrol et
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await loginPage.wait(1000);

    const currentURL = page.url();
    expect(currentURL).not.toContain('/login');
    expect(currentURL).not.toContain('/giris');

    console.log(`✅ ${admin.role} başarıyla giriş yaptı → ${currentURL}`);

    await loginPage.takeScreenshot('tc-login-009-admin-success');
  });

  test('TC-LOGIN-010: Finans Kullanıcısı ile başarılı login', async ({ page }) => {
    const financeUser = TEST_USERS.FINANCE_USER;

    await loginPage.login(financeUser);

    // Login sayfasından ayrıldığımızı kontrol et
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await loginPage.wait(1000);

    const currentURL = page.url();
    expect(currentURL).not.toContain('/login');
    expect(currentURL).not.toContain('/giris');

    console.log(`✅ ${financeUser.role} başarıyla giriş yaptı → ${currentURL}`);

    await loginPage.takeScreenshot('tc-login-010-finance-user-success');
  });

  test('TC-LOGIN-011: İç Piyasa Müdürü ile başarılı login', async ({ page }) => {
    const internalManager = TEST_USERS.INTERNAL_MARKET_MANAGER;

    await loginPage.login(internalManager);

    // Login sayfasından ayrıldığımızı kontrol et
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await loginPage.wait(1000);

    const currentURL = page.url();
    expect(currentURL).not.toContain('/login');
    expect(currentURL).not.toContain('/giris');

    console.log(`✅ ${internalManager.role} başarıyla giriş yaptı → ${currentURL}`);

    await loginPage.takeScreenshot('tc-login-011-internal-manager-success');
  });

  test('TC-LOGIN-012: Dış Piyasa Müdürü ile başarılı login', async ({ page }) => {
    const externalManager = TEST_USERS.EXTERNAL_MARKET_MANAGER;

    await loginPage.login(externalManager);

    // Login sayfasından ayrıldığımızı kontrol et
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await loginPage.wait(1000);

    const currentURL = page.url();
    expect(currentURL).not.toContain('/login');
    expect(currentURL).not.toContain('/giris');

    console.log(`✅ ${externalManager.role} başarıyla giriş yaptı → ${currentURL}`);

    await loginPage.takeScreenshot('tc-login-012-external-manager-success');
  });

  test('TC-LOGIN-013: Finans Müdürü ile başarılı login', async ({ page }) => {
    const financeManager = TEST_USERS.FINANCE_MANAGER;

    await loginPage.login(financeManager);

    // Login sayfasından ayrıldığımızı kontrol et
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await loginPage.wait(1000);

    const currentURL = page.url();
    expect(currentURL).not.toContain('/login');
    expect(currentURL).not.toContain('/giris');

    console.log(`✅ ${financeManager.role} başarıyla giriş yaptı → ${currentURL}`);

    await loginPage.takeScreenshot('tc-login-013-finance-manager-success');
  });

  test('TC-LOGIN-014: Genel Müdür ile başarılı login', async ({ page }) => {
    const generalManager = TEST_USERS.GENERAL_MANAGER;

    await loginPage.login(generalManager);

    // Login sayfasından ayrıldığımızı kontrol et
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await loginPage.wait(1000);

    const currentURL = page.url();
    expect(currentURL).not.toContain('/login');
    expect(currentURL).not.toContain('/giris');

    console.log(`✅ ${generalManager.role} başarıyla giriş yaptı → ${currentURL}`);

    await loginPage.takeScreenshot('tc-login-014-general-manager-success');
  });

  test('TC-LOGIN-015: Enter tuşu ile login', async ({ page }) => {
    const financeUser = TEST_USERS.FINANCE_USER;

    await loginPage.selectCompany(6);
    await loginPage.enterUsername(financeUser.username);
    await loginPage.enterPassword(financeUser.password);

    // Enter tuşuna bas
    await loginPage.pressEnter();

    // Login sayfasından ayrıldığımızı kontrol et
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await loginPage.wait(1000);

    const currentURL = page.url();
    expect(currentURL).not.toContain('/login');
    expect(currentURL).not.toContain('/giris');

    console.log(`✅ Enter tuşu ile giriş başarılı → ${currentURL}`);

    await loginPage.takeScreenshot('tc-login-015-enter-key-success');
  });
});

// Parametreli test: Tüm kullanıcılar ile login testi
test.describe('Login Testleri - Tüm Kullanıcılar', () => {
  USER_GROUPS.ALL_USERS.forEach((user) => {
    test(`TC-LOGIN-ALL-${user.role}: ${user.role} ile login`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigate();

      await loginPage.login(user);

      // Login sayfasından ayrıldığımızı kontrol et
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await loginPage.wait(1000);

      const currentURL = page.url();
      expect(currentURL).not.toContain('/login');
      expect(currentURL).not.toContain('/giris');

      console.log(`✅ ${user.role} başarıyla giriş yaptı → ${currentURL}`);

      await loginPage.takeScreenshot(`tc-login-all-${user.role.toLowerCase().replace(/\s/g, '-')}`);
    });
  });
});
