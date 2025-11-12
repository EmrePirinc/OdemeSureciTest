# Playwright Test Projesi

Bu proje http://167.16.21.50:81/ adresindeki E-flow uygulaması için Playwright test otomasyonu içerir.

## Kurulum

Gerekli paketler zaten yüklü. Eğer tekrar kurulum yapmanız gerekirse:

```bash
npm install
npx playwright install
```

## Test Çalıştırma

### Tüm testleri çalıştırma (headless mode)
```bash
npm test
```

### Testleri tarayıcı görünür şekilde çalıştırma
```bash
npm run test:headed
```

### UI modunda test çalıştırma (önerilen)
```bash
npm run test:ui
```

### Debug modunda test çalıştırma
```bash
npm run test:debug
```

### Sadece belirli bir tarayıcıda test çalıştırma
```bash
npm run test:chromium   # Sadece Chrome
npm run test:firefox    # Sadece Firefox
npm run test:webkit     # Sadece Safari
```

### Test raporu görüntüleme
```bash
npm run report
```

## Test Senaryoları

### Test Dosyaları

1. **tests/login.spec.ts** (20 Test Case)
   - Login sayfası yüklenmesi
   - Form elemanları kontrolü
   - Şirket dropdown testi
   - Validasyon testleri
   - Güvenlik testleri (SQL Injection, XSS)
   - Responsive testler
   - Performans testleri

2. **tests/authenticated.spec.ts** (15 Test Case)
   - Dashboard testleri
   - Navigasyon testleri
   - Satınalma talep işlemleri
   - Arama, filtreleme, sıralama
   - Export işlemleri

3. **tests/example.spec.ts** (Orijinal örnekler)

### Detaylı Test Senaryoları

Tüm test senaryolarının detaylı listesi için: [TEST_SCENARIOS.md](TEST_SCENARIOS.md)

**Toplam: 35+ Test Case**

## Test Dosyalarını Özelleştirme

Test dosyaları `tests/` klasöründe bulunur. `tests/example.spec.ts` dosyasını düzenleyerek kendi test senaryolarınızı ekleyebilirsiniz.

### Örnek test yapısı:

```typescript
test('Test açıklaması', async ({ page }) => {
  await page.goto('/');

  // Bir elemente tıklama
  await page.click('button.login');

  // Input alanını doldurma
  await page.fill('input[name="username"]', 'kullanici');

  // Doğrulama
  await expect(page).toHaveURL(/dashboard/);
});
```

## Yapılandırma

`playwright.config.ts` dosyasında aşağıdaki ayarlar yapılabilir:

- Base URL (şu an: http://167.16.21.50:81)
- Test timeout süreleri
- Tarayıcı seçenekleri
- Screenshot ve video kayıt ayarları

## Ekran Görüntüleri

Test sırasında alınan ekran görüntüleri `screenshots/` klasörüne kaydedilir.

## Helper Fonksiyonlar

Test yazmayı kolaylaştırmak için helper fonksiyonları kullanabilirsiniz:

```typescript
import { login, logout, isLoggedIn } from './helpers/auth.helper';
import { takeScreenshot } from './helpers/screenshot.helper';

// Kullanım örneği
test('Örnek test', async ({ page }) => {
  await login(page, {
    companyIndex: 1,
    username: 'testuser',
    password: 'testpass'
  });

  await takeScreenshot(page, 'test-name', 'description');
});
```

## Belirli Testleri Çalıştırma

```bash
# Sadece login testleri
npx playwright test login.spec.ts

# Sadece authenticated testleri
npx playwright test authenticated.spec.ts

# Belirli bir test case
npx playwright test --grep "TC-001"

# Belirli bir tarayıcıda
npx playwright test --project=chromium
```

## Önemli Notlar

1. **Authenticated Testler**: `tests/authenticated.spec.ts` dosyasındaki `TEST_CREDENTIALS` nesnesini gerçek kullanıcı bilgileriyle güncellemeniz gerekiyor:
   ```typescript
   const TEST_CREDENTIALS = {
     company: 'Anadolu Bakır',
     username: 'gerçek_kullanıcı',
     password: 'gerçek_şifre',
   };
   ```

2. **Site Analizi**: `analyze-site.ts` dosyasını çalıştırarak sitenin detaylı analizini yapabilirsiniz:
   ```bash
   npx ts-node analyze-site.ts
   ```

3. **Screenshot'lar**: Tüm test screenshot'ları `screenshots/` klasörüne otomatik kaydedilir

4. **Test Coverage**: 35+ test case ile kapsamlı test senaryoları mevcut

5. Her test bağımsız çalışır ve birbirini etkilemez
