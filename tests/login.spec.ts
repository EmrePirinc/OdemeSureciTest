import { test, expect } from '@playwright/test';

test.describe('Login Sayfası Testleri', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC-001: Login sayfasının yüklenmesi', async ({ page }) => {
    // Sayfa başlığını kontrol et
    await expect(page).toHaveTitle(/Satınalma Talep Sistemi/);

    // H1 başlığını kontrol et
    const h1 = page.locator('h1');
    await expect(h1).toHaveText('Hoş Geldiniz');

    // Şirket adını kontrol et
    const h3 = page.locator('h3');
    await expect(h3).toHaveText('Anadolu Bakır');

    // Ekran görüntüsü al
    await page.screenshot({ path: 'screenshots/tc-001-login-page-loaded.png' });
  });

  test('TC-002: Login form elemanlarının varlığı', async ({ page }) => {
    // Şirket dropdown'ının varlığını kontrol et
    const companySelect = page.locator('select').first();
    await expect(companySelect).toBeVisible();

    // Kullanıcı adı input'unun varlığını kontrol et
    const usernameInput = page.locator('input[type="text"]');
    await expect(usernameInput).toBeVisible();
    await expect(usernameInput).toHaveAttribute('placeholder', 'Kullanıcı adınızı giriniz');

    // Şifre input'unun varlığını kontrol et
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('placeholder', 'Şifrenizi giriniz');

    // Giriş yap butonunun varlığını kontrol et
    const loginButton = page.locator('button:has-text("Giriş Yap")');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
  });

  test('TC-003: Şirket dropdown seçenekleri', async ({ page }) => {
    const companySelect = page.locator('select').first();

    // Dropdown'ın görünür olduğunu doğrula
    await expect(companySelect).toBeVisible();

    // Seçenekleri kontrol et
    const options = await companySelect.locator('option').all();

    // 8 seçenek olduğunu doğrula
    expect(options.length).toBe(8);

    // Her seçeneği konsola yazdır
    console.log('Şirket seçenekleri:');
    for (let i = 0; i < options.length; i++) {
      const text = await options[i].textContent();
      const value = await options[i].getAttribute('value');
      console.log(`  ${i + 1}. ${text} (value: ${value})`);
    }

    // İlk seçeneği seç
    await companySelect.selectOption({ index: 1 });

    await page.screenshot({ path: 'screenshots/tc-003-company-selected.png' });
  });

  test('TC-004: Boş form ile giriş denemesi', async ({ page }) => {
    const loginButton = page.locator('button:has-text("Giriş Yap")');

    // Hiçbir şey girmeden giriş yap butonuna tıkla
    await loginButton.click();

    // Sayfanın hala login sayfasında olduğunu kontrol et
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');

    await page.screenshot({ path: 'screenshots/tc-004-empty-form-validation.png' });
  });

  test('TC-005: Sadece kullanıcı adı ile giriş denemesi', async ({ page }) => {
    const usernameInput = page.locator('input[type="text"]');
    const loginButton = page.locator('button:has-text("Giriş Yap")');

    // Sadece kullanıcı adı gir
    await usernameInput.fill('testuser');

    // Giriş yap butonuna tıkla
    await loginButton.click();

    await page.waitForTimeout(2000);

    // Hata mesajı veya doğrulama kontrolü
    await page.screenshot({ path: 'screenshots/tc-005-username-only.png' });
  });

  test('TC-006: Sadece şifre ile giriş denemesi', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button:has-text("Giriş Yap")');

    // Sadece şifre gir
    await passwordInput.fill('testpassword');

    // Giriş yap butonuna tıkla
    await loginButton.click();

    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/tc-006-password-only.png' });
  });

  test('TC-007: Geçersiz kullanıcı adı ve şifre ile giriş', async ({ page }) => {
    const companySelect = page.locator('select').first();
    const usernameInput = page.locator('input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button:has-text("Giriş Yap")');

    // Şirket seç
    await companySelect.selectOption({ index: 1 });

    // Geçersiz bilgiler gir
    await usernameInput.fill('invaliduser123');
    await passwordInput.fill('wrongpassword123');

    // Giriş yap
    await loginButton.click();

    await page.waitForTimeout(3000);

    // Hata mesajı kontrolü (varsa)
    const errorMessage = page.locator('.error, .alert, [role="alert"]').first();
    if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
      const errorText = await errorMessage.textContent();
      console.log('Hata mesajı:', errorText);
    }

    await page.screenshot({ path: 'screenshots/tc-007-invalid-credentials.png' });
  });

  test('TC-008: Şifre göster/gizle butonu', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('button').nth(0); // Şifre alanındaki buton

    // Şifre gir
    await passwordInput.fill('TestPassword123');

    // Şifrenin gizli olduğunu doğrula
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Toggle butonuna tıkla
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Şifrenin görünür olup olmadığını kontrol et
    const passwordInputAfterToggle = page.locator('input').nth(1);
    const typeAttr = await passwordInputAfterToggle.getAttribute('type');
    console.log('Şifre input type:', typeAttr);

    await page.screenshot({ path: 'screenshots/tc-008-password-toggle.png' });
  });

  test('TC-009: Input alanlarına yazma ve temizleme', async ({ page }) => {
    const usernameInput = page.locator('input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');

    // Kullanıcı adı gir
    await usernameInput.fill('testuser');
    await expect(usernameInput).toHaveValue('testuser');

    // Şifre gir
    await passwordInput.fill('testpassword');
    await expect(passwordInput).toHaveValue('testpassword');

    // Kullanıcı adını temizle
    await usernameInput.clear();
    await expect(usernameInput).toHaveValue('');

    // Şifreyi temizle
    await passwordInput.clear();
    await expect(passwordInput).toHaveValue('');

    await page.screenshot({ path: 'screenshots/tc-009-input-clear.png' });
  });

  test('TC-010: Placeholder metinlerinin doğruluğu', async ({ page }) => {
    const usernameInput = page.locator('input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');

    // Placeholder kontrolü
    await expect(usernameInput).toHaveAttribute('placeholder', 'Kullanıcı adınızı giriniz');
    await expect(passwordInput).toHaveAttribute('placeholder', 'Şifrenizi giriniz');
  });

  test('TC-011: Tüm alanları doldurarak giriş denemesi', async ({ page }) => {
    const companySelect = page.locator('select').first();
    const usernameInput = page.locator('input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button:has-text("Giriş Yap")');

    // Tüm alanları doldur
    await companySelect.selectOption({ index: 1 });
    await usernameInput.fill('testuser');
    await passwordInput.fill('testpassword');

    // Ekran görüntüsü al (giriş öncesi)
    await page.screenshot({ path: 'screenshots/tc-011-before-login.png' });

    // Giriş yap
    await loginButton.click();

    // Yönlendirme veya yanıt bekle
    await page.waitForTimeout(3000);

    // Giriş sonrası URL
    console.log('Giriş sonrası URL:', page.url());

    // Ekran görüntüsü al (giriş sonrası)
    await page.screenshot({ path: 'screenshots/tc-011-after-login.png' });
  });

  test('TC-012: Keyboard navigasyonu (Tab tuşu)', async ({ page }) => {
    const companySelect = page.locator('select').first();

    // İlk elemente focus
    await companySelect.focus();

    // Tab ile sırayla elementleri dolaş
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);

    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);

    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'screenshots/tc-012-keyboard-navigation.png' });
  });

  test('TC-013: Enter tuşu ile form gönderme', async ({ page }) => {
    const companySelect = page.locator('select').first();
    const usernameInput = page.locator('input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');

    // Form doldur
    await companySelect.selectOption({ index: 1 });
    await usernameInput.fill('testuser');
    await passwordInput.fill('testpassword');

    // Enter tuşuna bas
    await passwordInput.press('Enter');

    await page.waitForTimeout(3000);

    console.log('Enter sonrası URL:', page.url());

    await page.screenshot({ path: 'screenshots/tc-013-enter-submit.png' });
  });

  test('TC-014: Uzun kullanıcı adı ve şifre', async ({ page }) => {
    const usernameInput = page.locator('input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');

    const longUsername = 'a'.repeat(100);
    const longPassword = 'b'.repeat(100);

    await usernameInput.fill(longUsername);
    await passwordInput.fill(longPassword);

    // Değerlerin girildiğini kontrol et
    const usernameValue = await usernameInput.inputValue();
    const passwordValue = await passwordInput.inputValue();

    console.log('Kullanıcı adı uzunluğu:', usernameValue.length);
    console.log('Şifre uzunluğu:', passwordValue.length);

    await page.screenshot({ path: 'screenshots/tc-014-long-inputs.png' });
  });

  test('TC-015: Özel karakterler ile giriş', async ({ page }) => {
    const usernameInput = page.locator('input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');

    await usernameInput.fill('test@user#123!');
    await passwordInput.fill('P@ssw0rd!#$%');

    await page.screenshot({ path: 'screenshots/tc-015-special-characters.png' });
  });

  test('TC-016: SQL Injection denemesi (güvenlik)', async ({ page }) => {
    const usernameInput = page.locator('input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button:has-text("Giriş Yap")');

    // SQL Injection denemeleri
    await usernameInput.fill("admin' OR '1'='1");
    await passwordInput.fill("' OR '1'='1");

    await loginButton.click();
    await page.waitForTimeout(3000);

    // Güvenlik testi - giriş yapılmamalı
    expect(page.url()).toContain('/login');

    await page.screenshot({ path: 'screenshots/tc-016-sql-injection-test.png' });
  });

  test('TC-017: XSS denemesi (güvenlik)', async ({ page }) => {
    const usernameInput = page.locator('input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button:has-text("Giriş Yap")');

    // XSS denemeleri
    await usernameInput.fill('<script>alert("XSS")</script>');
    await passwordInput.fill('<img src=x onerror=alert(1)>');

    await loginButton.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'screenshots/tc-017-xss-test.png' });
  });

  test('TC-018: Responsive tasarım - Mobil görünüm', async ({ page }) => {
    // Mobil boyuta geç
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Elemanların görünür olduğunu kontrol et
    const usernameInput = page.locator('input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button:has-text("Giriş Yap")');

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();

    await page.screenshot({ path: 'screenshots/tc-018-mobile-view.png' });
  });

  test('TC-019: Responsive tasarım - Tablet görünüm', async ({ page }) => {
    // Tablet boyuta geç
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const usernameInput = page.locator('input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button:has-text("Giriş Yap")');

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();

    await page.screenshot({ path: 'screenshots/tc-019-tablet-view.png' });
  });

  test('TC-020: Sayfa performans testi', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`Login sayfası yüklenme süresi: ${loadTime}ms`);

    // 5 saniyeden kısa olmalı
    expect(loadTime).toBeLessThan(5000);
  });

});
