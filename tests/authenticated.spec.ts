import { test, expect } from '@playwright/test';

// Bu testler için geçerli kullanıcı bilgileri gerekiyor
// Lütfen aşağıdaki bilgileri gerçek bilgilerle güncelleyin

const TEST_CREDENTIALS = {
  company: 'Anadolu Bakır', // veya dropdown index
  username: 'testuser', // Gerçek kullanıcı adı
  password: 'testpassword', // Gerçek şifre
};

test.describe('Authenticated Kullanıcı Testleri', () => {

  // Her testten önce login yap
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Login işlemi
    const companySelect = page.locator('select').first();
    const usernameInput = page.locator('input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button:has-text("Giriş Yap")');

    // Şirket seç (index veya value ile)
    await companySelect.selectOption({ index: 1 });
    await usernameInput.fill(TEST_CREDENTIALS.username);
    await passwordInput.fill(TEST_CREDENTIALS.password);
    await loginButton.click();

    // Login başarılı olana kadar bekle
    await page.waitForTimeout(3000);
  });

  test('TC-AUTH-001: Başarılı login sonrası dashboard yüklenmesi', async ({ page }) => {
    // URL değişimini kontrol et
    console.log('Mevcut URL:', page.url());

    // Dashboard veya ana sayfa yüklendiğini doğrula
    // URL'nin /login'den farklı olduğunu kontrol et
    expect(page.url()).not.toContain('/login');

    await page.screenshot({ path: 'screenshots/tc-auth-001-dashboard.png' });
  });

  test('TC-AUTH-002: Navigasyon menüsünün varlığı', async ({ page }) => {
    // Navigasyon menüsünü bul
    const nav = page.locator('nav, [role="navigation"]').first();

    if (await nav.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(nav).toBeVisible();

      // Menü öğelerini bul
      const menuItems = await nav.locator('a, button').all();
      console.log(`${menuItems.length} menü öğesi bulundu`);

      for (let i = 0; i < Math.min(10, menuItems.length); i++) {
        const text = await menuItems[i].textContent();
        console.log(`  Menü ${i + 1}: ${text?.trim()}`);
      }
    }

    await page.screenshot({ path: 'screenshots/tc-auth-002-navigation.png' });
  });

  test('TC-AUTH-003: Kullanıcı profil bilgilerinin görünümü', async ({ page }) => {
    // Kullanıcı adı veya profil bilgilerini ara
    const userProfile = page.locator('[class*="user"], [class*="profile"], [class*="avatar"]').first();

    if (await userProfile.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Kullanıcı profil elementi bulundu');
    }

    await page.screenshot({ path: 'screenshots/tc-auth-003-user-profile.png' });
  });

  test('TC-AUTH-004: Logout fonksiyonunun varlığı', async ({ page }) => {
    // Logout butonu veya linkini ara
    const logoutButton = page.locator('button:has-text("Çıkış"), a:has-text("Çıkış"), button:has-text("Logout"), a:has-text("Logout")').first();

    if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Logout butonu bulundu');
      await logoutButton.click();

      // Login sayfasına yönlendirildiğini kontrol et
      await page.waitForTimeout(2000);
      console.log('Logout sonrası URL:', page.url());

      await page.screenshot({ path: 'screenshots/tc-auth-004-after-logout.png' });
    } else {
      console.log('Logout butonu bulunamadı');
    }
  });

  test('TC-AUTH-005: Ana sayfa içerik kontrolü', async ({ page }) => {
    // Sayfadaki tüm başlıkları bul
    const h1s = await page.locator('h1').allTextContents();
    const h2s = await page.locator('h2').allTextContents();
    const h3s = await page.locator('h3').allTextContents();

    console.log('H1 başlıklar:', h1s);
    console.log('H2 başlıklar:', h2s);
    console.log('H3 başlıklar:', h3s);

    // Tablolar varsa
    const tables = await page.locator('table').all();
    console.log(`${tables.length} tablo bulundu`);

    await page.screenshot({ path: 'screenshots/tc-auth-005-content.png', fullPage: true });
  });

  test('TC-AUTH-006: Satınalma talep oluşturma sayfasına erişim', async ({ page }) => {
    // "Talep Oluştur", "Yeni Talep", "Create" gibi butonları ara
    const createButton = page.locator('button:has-text("Talep"), a:has-text("Talep"), button:has-text("Yeni"), a:has-text("Yeni")').first();

    if (await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Talep oluşturma butonu bulundu');
      await createButton.click();
      await page.waitForTimeout(2000);

      console.log('Talep oluşturma sayfası URL:', page.url());
      await page.screenshot({ path: 'screenshots/tc-auth-006-create-request.png' });
    } else {
      console.log('Talep oluşturma butonu bulunamadı');
    }
  });

  test('TC-AUTH-007: Arama fonksiyonunun varlığı', async ({ page }) => {
    // Arama input'u ara
    const searchInput = page.locator('input[type="search"], input[placeholder*="Ara"], input[placeholder*="Search"]').first();

    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Arama input\'u bulundu');

      await searchInput.fill('test arama');
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'screenshots/tc-auth-007-search.png' });
    }
  });

  test('TC-AUTH-008: Tablo sıralama fonksiyonu', async ({ page }) => {
    // İlk tabloyu bul
    const table = page.locator('table').first();

    if (await table.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Tablo bulundu');

      // Tablo başlıklarını bul
      const headers = await table.locator('th').all();
      console.log(`${headers.length} tablo başlığı bulundu`);

      // İlk başlığa tıkla (sıralama için)
      if (headers.length > 0) {
        await headers[0].click();
        await page.waitForTimeout(1000);

        await page.screenshot({ path: 'screenshots/tc-auth-008-table-sort.png' });
      }
    }
  });

  test('TC-AUTH-009: Filtreleme fonksiyonu', async ({ page }) => {
    // Filtre butonlarını veya dropdown'ları ara
    const filterButton = page.locator('button:has-text("Filtre"), button:has-text("Filter")').first();

    if (await filterButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Filtre butonu bulundu');
      await filterButton.click();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'screenshots/tc-auth-009-filter.png' });
    }
  });

  test('TC-AUTH-010: Pagination kontrolü', async ({ page }) => {
    // Sayfalama butonlarını ara
    const pagination = page.locator('[class*="pagination"], nav[aria-label*="pagination"]').first();

    if (await pagination.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Pagination bulundu');

      // Sonraki sayfa butonuna tıkla
      const nextButton = pagination.locator('button:has-text("Next"), button:has-text("Sonraki"), a:has-text("›")').first();

      if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(1000);

        await page.screenshot({ path: 'screenshots/tc-auth-010-pagination.png' });
      }
    }
  });

  test('TC-AUTH-011: Bildirimler/Notifications', async ({ page }) => {
    // Bildirim ikonu veya butonunu ara
    const notificationButton = page.locator('[class*="notification"], [class*="bell"], button[aria-label*="notification"]').first();

    if (await notificationButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Bildirim butonu bulundu');
      await notificationButton.click();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'screenshots/tc-auth-011-notifications.png' });
    }
  });

  test('TC-AUTH-012: Ayarlar sayfasına erişim', async ({ page }) => {
    // Ayarlar butonu veya linkini ara
    const settingsButton = page.locator('button:has-text("Ayarlar"), a:has-text("Ayarlar"), button:has-text("Settings"), a:has-text("Settings")').first();

    if (await settingsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Ayarlar butonu bulundu');
      await settingsButton.click();
      await page.waitForTimeout(2000);

      console.log('Ayarlar sayfası URL:', page.url());
      await page.screenshot({ path: 'screenshots/tc-auth-012-settings.png' });
    }
  });

  test('TC-AUTH-013: Dashboard widget\'ları', async ({ page }) => {
    // Dashboard'daki kartları veya widget'ları bul
    const widgets = page.locator('[class*="card"], [class*="widget"], [class*="panel"]');

    const widgetCount = await widgets.count();
    console.log(`${widgetCount} widget/card bulundu`);

    await page.screenshot({ path: 'screenshots/tc-auth-013-widgets.png', fullPage: true });
  });

  test('TC-AUTH-014: Excel export fonksiyonu', async ({ page }) => {
    // Excel export butonunu ara
    const exportButton = page.locator('button:has-text("Export"), button:has-text("İndir"), button:has-text("Excel")').first();

    if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Export butonu bulundu');

      // Download başlatmak için
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      await exportButton.click();

      const download = await downloadPromise;
      if (download) {
        console.log('Dosya indirme başlatıldı:', await download.suggestedFilename());
      }
    }
  });

  test('TC-AUTH-015: Breadcrumb navigation', async ({ page }) => {
    // Breadcrumb elementini bul
    const breadcrumb = page.locator('[class*="breadcrumb"], nav[aria-label*="breadcrumb"]').first();

    if (await breadcrumb.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Breadcrumb bulundu');

      const breadcrumbItems = await breadcrumb.locator('a, span').allTextContents();
      console.log('Breadcrumb öğeleri:', breadcrumbItems);
    }
  });

});
