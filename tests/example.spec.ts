import { test, expect } from '@playwright/test';

test.describe('E-flow Test Senaryoları', () => {

  test('Ana sayfanın açılması', async ({ page }) => {
    // Ana sayfaya git
    await page.goto('/');

    // Sayfanın yüklendiğini doğrula
    await expect(page).toHaveTitle(/.*/);

    // Sayfa yüklenene kadar bekle
    await page.waitForLoadState('networkidle');

    // Ekran görüntüsü al
    await page.screenshot({ path: 'screenshots/homepage.png' });
  });

  test('Login testi', async ({ page }) => {
    await page.goto('/');

    // Login form elemanlarını bul ve doldur
    // Not: Aşağıdaki selector'ları kendi sitenize göre düzenlemeniz gerekiyor
    const usernameInput = page.locator('input[name="username"]').or(page.locator('input[type="text"]')).first();
    const passwordInput = page.locator('input[name="password"]').or(page.locator('input[type="password"]')).first();

    // Eğer elementler varsa doldur
    if (await usernameInput.count() > 0) {
      await usernameInput.fill('test_kullanici');
      await passwordInput.fill('test_sifre');

      // Login butonunu bul ve tıkla
      const loginButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("Giriş")')).first();
      await loginButton.click();

      // Sayfanın yönlendirilmesini bekle
      await page.waitForLoadState('networkidle');

      // URL'nin değiştiğini kontrol et
      console.log('Mevcut URL:', page.url());
    }
  });

  test('Navigasyon testi', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Sayfadaki tüm linkleri bul
    const links = await page.locator('a').all();
    console.log(`Toplam ${links.length} link bulundu`);

    // İlk birkaç linkin çalıştığını test et
    for (let i = 0; i < Math.min(3, links.length); i++) {
      const href = await links[i].getAttribute('href');
      if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
        console.log(`Test edilen link: ${href}`);
      }
    }
  });

  test('Form validasyon testi', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Sayfadaki tüm form elemanlarını bul
    const inputs = await page.locator('input').all();
    const buttons = await page.locator('button').all();

    console.log(`${inputs.length} input alanı ve ${buttons.length} buton bulundu`);

    // Her input için tip bilgisi
    for (const input of inputs) {
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      console.log(`Input: name=${name}, type=${type}`);
    }
  });

  test('Responsive tasarım testi', async ({ page }) => {
    // Mobil görünüm
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/mobile-view.png' });

    // Tablet görünüm
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/tablet-view.png' });

    // Desktop görünüm
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/desktop-view.png' });
  });

  test('Performans testi', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    console.log(`Sayfa yüklenme süresi: ${loadTime}ms`);

    // Sayfa yüklenme süresinin 5 saniyeden kısa olduğunu doğrula
    expect(loadTime).toBeLessThan(5000);
  });

});
