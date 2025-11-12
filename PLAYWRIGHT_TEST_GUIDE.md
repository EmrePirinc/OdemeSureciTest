# Playwright Test Rehberi - Ödeme Süreci Yönetim Sistemi

## 📋 İçindekiler

1. [Giriş ve Genel Bakış](#giriş-ve-genel-bakış)
2. [Kullanıcı Rolleri ve Yetkilendirme](#kullanıcı-rolleri-ve-yetkilendirme)
3. [Test Altyapısı](#test-altyapısı)
4. [Proje Yapısı - Ödeme Süreci](#proje-yapısı---ödeme-süreci)
5. [Test Yazma Kuralları](#test-yazma-kuralları)
6. [Test Senaryoları](#test-senaryoları)
7. [Page Object Pattern Örnekleri](#page-object-pattern-örnekleri)
8. [Backend Bağımsızlığı ve Test Stratejisi](#backend-bağımsızlığı-ve-test-stratejisi)
9. [Debugging ve Troubleshooting](#debugging-ve-troubleshooting)
10. [CI/CD Entegrasyonu](#cicd-entegrasyonu)

---

## 🎯 Giriş ve Genel Bakış

### Proje Tanıtımı

**Ödeme Süreci Yönetim Sistemi**, SAP Business One ile entegre çalışan, fatura ödemelerini 6 aşamalı bir onay sürecinden geçirerek yöneten bir web uygulamasıdır.

**Temel Özellikler:**
- ✅ JWT tabanlı kimlik doğrulama
- ✅ Rol bazlı yetkilendirme (6 farklı rol)
- ✅ 6 aşamalı ödeme onay süreci
- ✅ Görev yönetimi (Task Management)
- ✅ Aşamalar arası geri atama (Rollback)
- ✅ Ekstre yönetimi (Upload/Download)
- ✅ Excel talimat oluşturma
- ✅ Modern React + TypeScript + Tailwind CSS

### Test Stratejisi

Bu proje için **E2E (End-to-End) testing** yaklaşımı benimsenmiştir:

- **Test Framework**: Playwright
- **Pattern**: Page Object Model (POM)
- **BDD Support**: Cucumber (opsiyonel)
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12
- **Backend**: Gerçek API ile test (Mock-free)

**Test Kapsamı:**
- ✅ **Login/Authentication** modülü
- ✅ **Ödeme Süreci** (6 aşama detaylı)
- ✅ **Görev Listesi** (Task Management)
- ✅ **Tamamlanan Süreçler**
- ❌ **Satınalma Talep** modülü (test edilmiyor)

### Playwright Neden Seçildi?

1. **Çoklu Browser Desteği**: Chromium, Firefox, WebKit (Safari)
2. **Auto-Wait**: Otomatik bekleme mekanizması
3. **Paralel Test Çalıştırma**: Hızlı test execution
4. **TypeScript Desteği**: Tip güvenliği
5. **Güçlü Debugging**: Trace viewer, inspector, video recording
6. **Mobile Testing**: Gerçek cihaz simülasyonu
7. **BDD Support**: Cucumber entegrasyonu

---

## 👥 Kullanıcı Rolleri ve Yetkilendirme

### Test Kullanıcıları

Sistemde 6 farklı kullanıcı rolü bulunmaktadır. Her rol farklı aşamalarda farklı yetkilere sahiptir.

| Kullanıcı Adı / E-posta | Şifre | Rol | Aşama Yetkileri |
|-------------------------|-------|-----|-----------------|
| `hasanHelvali` | `Hasan6969+` | **Admin** | Tüm aşamalar (görüntüleme) |
| `test` | `deneme` | **Finans Kullanıcısı** | Stage 1, 3, 6 |
| `icpiyasa.@mail.com` | `1234` | **İç Piyasa Müdürü** | Stage 2 (kendi faturaları) |
| `dispiyasa@mail.com` | `1234` | **Dış Piyasa Müdürü** | Stage 2 (kendi faturaları) |
| `finans.muduru@mail.com` | `1234` | **Finans Müdürü** | Stage 4 |
| `genel.mudur@mail.com` | `1234` | **Genel Müdür** | Stage 5 (nihai onay) |

### Rol Bazlı Yetki Matrisi

#### 🔹 Admin (hasanHelvali)
- ✅ Tüm süreçleri görüntüleme
- ✅ Sistem ayarları
- ⚠️ Onay yetkisi YOK (sadece görüntüleme)

---

### Aşama Bazlı Detaylı Yetki Matrisleri

#### **Aşama 1: Başlatma (Finans Çalışanı)**

Finans çalışanı sorgu oluşturur, **fatura detaylarında ödenecek tutarları düzenler**, **faturaları siler** ve onaya gönderir. **Özette toplam ödeme tutarı düzenlenemez, sadece görüntülenir.**

| Alan | Finans Çalışanı | İç Piyasa Müdürü | Dış Piyasa Müdürü | Finans Müdürü | Genel Müdür |
|------|-----------------|------------------|-------------------|---------------|-------------|
| Ödenecek Tutar (Detay Sayfası) | ✅ Düzenleyebilir | ❌ | ❌ | ❌ | ❌ |
| Fatura Silme (Detay Sayfası) | ✅ Silebilir | ❌ | ❌ | ❌ | ❌ |
| Toplam Ödeme (Özet) | ❌ Read-only | ❌ | ❌ | ❌ | ❌ |
| Cari Detay Popup | ✅ Açabilir/Düzenleyebilir | ❌ | ❌ | ❌ | ❌ |
| Ekstre | ❌ | ❌ | ❌ | ❌ | ❌ |

**Test Odağı:** Finans kullanıcısının sadece detay sayfasında düzenleme yapabildiğini, özette düzenleyemediğini doğrula.

---

#### **Aşama 2: Bölüm Müdürleri Onayı**

Belgeler İç Piyasa ve Dış Piyasa olarak ayrılır. Her müdür **fatura detaylarında ödenecek tutarları düzenler**, **faturaları siler**, **özette toplam ödeme tutarını düzenler** ve **cari detay popup'ı açabilir**.

| Alan | Finans Çalışanı | İç Piyasa Müdürü | Dış Piyasa Müdürü | Finans Müdürü | Genel Müdür |
|------|-----------------|------------------|-------------------|---------------|-------------|
| Ödenecek Tutar (Detay Sayfası) | ❌ | ✅ Düzenleyebilir | ✅ Düzenleyebilir | ❌ | ❌ |
| Fatura Silme (Detay Sayfası) | ❌ | ✅ Silebilir | ✅ Silebilir | ❌ | ❌ |
| Toplam Ödeme (Özet) | ❌ | ✅ Düzenleyebilir | ✅ Düzenleyebilir | ❌ | ❌ |
| Cari Detay Popup | ❌ | ✅ Açabilir/Düzenleyebilir | ✅ Açabilir/Düzenleyebilir | ❌ | ❌ |
| Ekstre | ❌ | ❌ | ❌ | ❌ | ❌ |

**Önemli:** Her iki müdür de kendi sorumluluğundaki faturaları onayladıktan sonra süreç bir sonraki aşamaya geçer.

**Test Odağı:** İki müdürün de onaylaması gerektiğini, sadece kendi departmanlarının faturalarını görebildiklerini doğrula.

---

#### **Aşama 3: Konsolidasyon ve Ekstre Yükleme (Finans Çalışanı)**

Belgeler birleştirilir. Finans çalışanı **fatura detaylarında ödenecek tutarları düzenler**, **faturaları siler**, **özette toplam ödeme tutarını düzenler**, **cari detay popup'ı açabilir** ve **her cari için zorunlu olarak ekstre ekler**.

| Alan | Finans Çalışanı | İç Piyasa Müdürü | Dış Piyasa Müdürü | Finans Müdürü | Genel Müdür |
|------|-----------------|------------------|-------------------|---------------|-------------|
| Ödenecek Tutar (Detay Sayfası) | ✅ Düzenleyebilir | ❌ | ❌ | ❌ | ❌ |
| Fatura Silme (Detay Sayfası) | ✅ Silebilir | ❌ | ❌ | ❌ | ❌ |
| Toplam Ödeme (Özet) | ✅ Düzenleyebilir | ❌ | ❌ | ❌ | ❌ |
| Cari Detay Popup | ✅ Açabilir/Düzenleyebilir | ❌ | ❌ | ❌ | ❌ |
| Ekstre | ✅ **Yüklemeli (Zorunlu)** | ❌ | ❌ | ❌ | ❌ |

**Kural:** Tüm cariler için ekstre yüklenmedikçe bir sonraki aşamaya geçilemez.

**Test Odağı:** Ekstre yükleme zorunluluğunu, tüm cariler için ekstre olmadan ilerleyememesini doğrula.

---

#### **Aşama 4: Finans Müdürü Onayı**

Finans müdürü **fatura detaylarında ödenecek tutarları düzenler**, **faturaları siler**, **özette toplam ödeme tutarını düzenler**, **cari detay popup'ı açabilir**, **ekstreleri görüntüler/yükler/günceller**, onaya gönderir veya **geri atar**.

| Alan | Finans Çalışanı | İç Piyasa Müdürü | Dış Piyasa Müdürü | Finans Müdürü | Genel Müdür |
|------|-----------------|------------------|-------------------|---------------|-------------|
| Ödenecek Tutar (Detay Sayfası) | ❌ | ❌ | ❌ | ✅ Düzenleyebilir | ❌ |
| Fatura Silme (Detay Sayfası) | ❌ | ❌ | ❌ | ✅ Silebilir | ❌ |
| Toplam Ödeme (Özet) | ❌ | ❌ | ❌ | ✅ Düzenleyebilir | ❌ |
| Cari Detay Popup | ❌ | ❌ | ❌ | ✅ Açabilir/Düzenleyebilir | ❌ |
| Ekstre | ❌ | ❌ | ❌ | ✅ **Yükleyebilir/Güncelleyebilir** | ❌ |

**Yetki:** Finans müdürü süreci **Aşama 3'e (Finans Çalışanı'na) geri atabilir** ve ret sebebi girebilir.

**Test Odağı:** Geri atama özelliğini, ret sebebi girişini, görev yönetimini (Stage 3'e görev oluşturma) doğrula.

---

#### **Aşama 5: Genel Müdür Nihai Onayı**

Genel müdür **fatura detaylarında ödenecek tutarları düzenler**, **faturaları siler**, **özette toplam ödeme tutarını düzenler**, **ekstreleri günceller** ve **"Detay" butonu ile cari bazında gruplanmış fatura detaylarına popup ile erişebilir**.

| Alan | Finans Çalışanı | İç Piyasa Müdürü | Dış Piyasa Müdürü | Finans Müdürü | Genel Müdür |
|------|-----------------|------------------|-------------------|---------------|-------------|
| Ödenecek Tutar (Detay Sayfası) | ❌ | ❌ | ❌ | ❌ | ✅ Düzenleyebilir |
| Fatura Silme (Detay Sayfası) | ❌ | ❌ | ❌ | ❌ | ✅ Silebilir |
| Toplam Ödeme (Özet) | ❌ | ❌ | ❌ | ❌ | ✅ Düzenleyebilir |
| Cari Detay Popup | ❌ | ❌ | ❌ | ❌ | ✅ **Açabilir/Düzenleyebilir** |
| Ekstre | ❌ | ❌ | ❌ | ❌ | ✅ Güncelleyebilir |

**Önemli Değişiklik:**
- Bu aşamada **"Onaya Gönder"** butonu **"Onayla"** olarak değişir.
- Onaylanan belge için Finans Çalışanı'na Excel ile mail gönderilir.
- Genel müdür süreci **Aşama 4'e (Finans Müdürü'ne) geri atabilir** ve ret sebebi girebilir.

**Test Odağı:** "Onayla" butonunun varlığını, geri atama özelliğini, email bildirimini doğrula.

---

#### **Aşama 6: Talimat Oluşturma (Finans Çalışanı) 🔒**

**🔒 TÜM ALANLAR SALT OKUNURDUR (READ-ONLY) 🔒**

| Alan | Finans Çalışanı | İç Piyasa Müdürü | Dış Piyasa Müdürü | Finans Müdürü | Genel Müdür |
|------|-----------------|------------------|-------------------|---------------|-------------|
| Ödenecek Tutar (Detay Sayfası) | 👁️ **Sadece Görüntüleme** | ❌ | ❌ | ❌ | ❌ |
| Fatura Silme (Detay Sayfası) | ❌ **DÜZENLENemez** | ❌ | ❌ | ❌ | ❌ |
| Toplam Ödeme (Özet) | 👁️ **Sadece Görüntüleme** | ❌ | ❌ | ❌ | ❌ |
| Cari Detay Popup | 👁️ **Sadece Görüntüleme** | ❌ | ❌ | ❌ | ❌ |
| Ekstre | 👁️ **Sadece Görüntüleme** | ❌ | ❌ | ❌ | ❌ |
| Talimat Oluştur | ✅ **Excel Export** | ❌ | ❌ | ❌ | ❌ |

**Kritik Kısıtlama:**
- ❌ **DETAY SAYFASINDA tutar düzenlenemez**
- ❌ **DETAY SAYFASINDA fatura silinemez**
- ❌ **ÖZETTE tutar düzenlenemez**
- ❌ **CARİ DETAY POPUP'TA düzenleme yapılamaz**
- ❌ **EKSTRE yüklenemez/güncellenemez**
- ✅ **SADECE "Talimat Oluştur" butonu aktif**

**Son Adım:** Talimat oluşturulduktan sonra süreç **"Tamamlanan Süreçler"** arşivine taşınır.

**Test Odağı:** TÜM alanların disabled olduğunu, sadece Excel export butonunun aktif olduğunu, talimat sonrası arşivlenmeyi doğrula.

### Ödeme Süreci Akışı

```
┌──────────────────────────────────────────────────────────────────┐
│                    ÖDEME SÜRECİ AŞAMALARI                         │
└──────────────────────────────────────────────────────────────────┘

Stage 1: Finans Kullanıcısı
├─ SAP'tan fatura çekme
├─ Fatura detaylarını düzenleme
├─ Faturaları silme (soft delete)
└─ Onaya gönderme
      ↓
Stage 2: İç/Dış Piyasa Müdürleri (Paralel Onay)
├─ İç Piyasa Müdürü → İç piyasa faturaları
├─ Dış Piyasa Müdürü → Dış piyasa faturaları
└─ HER İKİSİ de onaylamalı
      ↓
Stage 3: Finans Kullanıcısı
├─ Faturaları konsolide etme
├─ HER cari için ekstre yükleme (ZORUNLU)
└─ Onaya gönderme
      ↓
Stage 4: Finans Müdürü
├─ İnceleme
├─ Ekstre kontrolü
├─ Onaylama VEYA Aşama 3'e geri atama
      ↓
Stage 5: Genel Müdür
├─ Nihai inceleme
├─ Onaylama (final) VEYA Aşama 4'e geri atama
      ↓
Stage 6: Finans Kullanıcısı (READ-ONLY)
├─ TÜM ALANLAR READ-ONLY
├─ Ekstre görüntüleme
└─ Talimat oluştur (Excel export)
      ↓
Tamamlanan Süreçler (Archive)
```

---

## ⚙️ Test Altyapısı

### Proje Yapısı

```
project-root/
├── tests/                          # Test dizini
│   ├── pages/                      # Page Object classes
│   │   ├── BasePage.ts            # Base page class
│   │   ├── LoginPage.ts           # Login page
│   │   ├── PaymentInfoFormPage.ts # Payment info form
│   │   ├── PaymentSummaryPage.ts  # Payment summary
│   │   └── PaymentTaskListPage.ts # Task list
│   ├── cucumber/                   # Cucumber BDD (opsiyonel)
│   │   ├── features/              # .feature files
│   │   ├── steps/                 # Step definitions
│   │   └── support/               # Hooks, world
│   ├── login.spec.ts              # Login test suite
│   ├── payment-process.spec.ts    # Payment process tests
│   └── README.md                   # Test documentation
├── playwright.config.ts            # Playwright konfigürasyonu
├── package.json                    # Dependencies
└── .env.test                       # Test environment variables
```

### Playwright Konfigürasyonu

**Dosya**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  use: {
    baseURL: 'http://167.16.21.50:81/', // Gerçek site
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
});
```

### Test Komutları

```bash
# Tüm testleri çalıştır
npm run test

# Headed mode (tarayıcı görünür)
npm run test:headed

# UI mode (interaktif)
npm run test:ui

# Debug mode
npm run test:debug

# Sadece belirli bir dosya
npx playwright test tests/login.spec.ts

# Sadece belirli bir browser
npx playwright test --project=chromium

# HTML report göster
npm run test:report

# Cucumber testleri (BDD)
npm run test:cucumber
```

### Environment Variables

**Dosya**: `.env.test`

```env
# Test Environment Configuration
BASE_URL=http://167.16.21.50:81/
HEADLESS=true
VIDEO=false
SCREENSHOT=on-failure
TRACE=on-first-retry

# Test Users
ADMIN_USER=hasanHelvali
ADMIN_PASS=Hasan6969+

FINANS_USER=test
FINANS_PASS=deneme

IC_PIYASA_USER=icpiyasa.@mail.com
IC_PIYASA_PASS=1234

DIS_PIYASA_USER=dispiyasa@mail.com
DIS_PIYASA_PASS=1234

FINANS_MUDURU_USER=finans.muduru@mail.com
FINANS_MUDURU_PASS=1234

GENEL_MUDUR_USER=genel.mudur@mail.com
GENEL_MUDUR_PASS=1234
```

---

## 🏗️ Proje Yapısı - Ödeme Süreci

### Route Yapısı

```typescript
// src/App.tsx

<Routes>
  {/* Default redirect */}
  <Route path="/" element={<Navigate to="/payment/tasks" replace />} />

  {/* Public routes */}
  <Route path="/login" element={<Login />} />

  {/* Protected routes - Finans ekibi için */}
  <Route element={<ProtectedRoute allowedRoles={[
    "admin", "FinansCalisani", "IthalatMuduru",
    "IcPiyasaMuduru", "FinansMuduru", "GenelMudur"
  ]} />}>
    <Route path="/payment/tasks" element={<PaymentTaskList />} />
    <Route path="/payment/invoices/:processId" element={<PaymentInfoForm />} />
    <Route path="/payment/summary/:processId" element={<PaymentSummary />} />
    <Route path="/payment/combined/:processId" element={<PaymentCombined />} />
    <Route path="/payment/instruction/:processId" element={<PaymentInstruction />} />
    <Route path="/payment/completed/:processId" element={<CompletedProcessView />} />
  </Route>
</Routes>
```

### Sayfa Yapısı

#### 1. **Login** (`/login`)
- **Amaç**: JWT authentication
- **Test Alanları**:
  - Şirket dropdown (Company selection)
  - Kullanıcı adı input
  - Şifre input (visibility toggle)
  - Login butonu
  - Hata mesajları
  - Enter key support

#### 2. **PaymentTaskList** (`/payment/tasks`)
- **Amaç**: Kullanıcının görev listesi (inbox)
- **Test Alanları**:
  - Görev listesi tablosu
  - Filtreleme (Süreç tipi, Aşama, Tarih)
  - "Göreve Git" butonu
  - Statü göstergesi
  - Sayfalama

#### 3. **PaymentInfoForm** (`/payment/invoices/:processId`)
- **Amaç**: Stage 1 - Ödeme bilgileri ve fatura listesi
- **Test Alanları**:
  - Form Tarihi, Ödeme Tarihi
  - Döviz Türü (TRY, EUR, USD)
  - Vade Başlangıç/Bitiş Tarihi
  - "Listeyi Çek" butonu
  - Fatura tablosu
  - Inline edit (Ödenecek Tutar)
  - Multi-select checkbox (Silme için)
  - "Seçimleri Sil" butonu
  - "Özet Oluştur" butonu

#### 4. **PaymentSummary** (`/payment/summary/:processId`)
- **Amaç**: Stage 3-6 - Cari bazında özet ve onay
- **Test Alanları**:
  - Cari gruplaması tablosu
  - Toplam Ödeme (editable - aşamaya göre)
  - Ekstre yükleme/görüntüleme
  - "Detay" butonu (popup açar)
  - Süreç notları (textarea)
  - "Onaya Gönder" / "Onayla" / "Geri Ata" butonları
  - Stage-based permissions

#### 5. **PaymentCombined** (`/payment/combined/:processId`)
- **Amaç**: Detay + Özet birleşik görünüm
- **Test Alanları**: PaymentInfoForm + PaymentSummary kombinasyonu

#### 6. **PaymentInstruction** (`/payment/instruction/:processId`)
- **Amaç**: Stage 6 - Talimat oluşturma (READ-ONLY)
- **Test Alanları**:
  - READ-ONLY tablo
  - "Talimat Oluştur" butonu
  - Excel export

#### 7. **CompletedProcessView** (`/payment/completed/:processId`)
- **Amaç**: Tamamlanan süreçleri görüntüleme
- **Test Alanları**:
  - Archive görünümü
  - Süreç geçmişi
  - Tüm aşamaların özeti

### Context API Yapısı

#### UserContext
```typescript
// Kullanıcı bilgilerini global olarak saklar
{
  user: {
    id: string;
    userName: string;
    email: string;
    nameLastName: string;
    roles: string[];
    sapEmpId: string;
  };
  setUser: (user) => void;
}
```

#### UIContext
```typescript
// UI durumlarını yönetir
{
  showSpinner: boolean;
  setShowSpinner: (show: boolean) => void;
  toast: {
    show: (message: string, type: 'success' | 'error') => void;
  };
}
```

---

## 📝 Test Yazma Kuralları

### Naming Conventions

#### Test Dosyaları
```
✅ login.spec.ts
✅ payment-process.spec.ts
✅ payment-stage1.spec.ts
✅ payment-stage2.spec.ts

❌ test1.spec.ts
❌ myTest.spec.ts
```

#### Test Describe Blokları
```typescript
// ✅ Türkçe ve açıklayıcı
test.describe('Login Functionality Tests', () => {
  // tests...
});

test.describe('Payment Process - Stage 1', () => {
  // tests...
});

// ❌ Belirsiz ve kısa
test.describe('Tests', () => {
  // tests...
});
```

#### Test Case İsimleri
```typescript
// ✅ Açık ve anlaşılır
test('should login successfully with valid credentials', async ({ page }) => {
  // ...
});

test('should display error when company is not selected', async ({ page }) => {
  // ...
});

test('should allow Finance User to edit payable amount in Stage 1', async ({ page }) => {
  // ...
});

// ❌ Kısa ve belirsiz
test('login test', async ({ page }) => {
  // ...
});

test('edit test', async ({ page }) => {
  // ...
});
```

### Test Organization

#### Hooks Kullanımı

```typescript
test.describe('Payment Process Tests', () => {
  let paymentPage: PaymentSummaryPage;

  // Her testten ÖNCE çalışır
  test.beforeEach(async ({ page }) => {
    paymentPage = new PaymentSummaryPage(page);

    // Login işlemi
    await page.goto('/login');
    await page.fill('[name="username"]', 'test');
    await page.fill('[name="password"]', 'deneme');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/payment/tasks');
  });

  // Her testten SONRA çalışır
  test.afterEach(async ({ page }) => {
    // Cleanup işlemleri
    await page.close();
  });

  test('should navigate to payment summary', async ({ page }) => {
    // Test implementation
  });
});
```

### Assertions Patterns

#### Görünürlük Kontrolleri
```typescript
// ✅ Element görünür mü?
await expect(page.locator('#login-button')).toBeVisible();

// ✅ Element gizli mi?
await expect(page.locator('#error-message')).toBeHidden();

// ✅ Element enabled mı?
await expect(page.locator('button[type="submit"]')).toBeEnabled();

// ✅ Element disabled mı?
await expect(page.locator('#save-button')).toBeDisabled();
```

#### Metin Kontrolleri
```typescript
// ✅ Tam eşleşme
await expect(page.locator('h1')).toHaveText('Ödeme Süreci');

// ✅ Kısmi eşleşme
await expect(page.locator('.error-message')).toContainText('hata');

// ✅ Boş değil
await expect(page.locator('#invoice-count')).not.toBeEmpty();
```

#### Sayı ve Değer Kontrolleri
```typescript
// ✅ Value kontrolü
await expect(page.locator('#payable-amount')).toHaveValue('1000');

// ✅ Attribute kontrolü
await expect(page.locator('input[type="password"]'))
  .toHaveAttribute('type', 'password');

// ✅ Count kontrolü
const rows = page.locator('table tbody tr');
await expect(rows).toHaveCount(10);
```

#### URL ve Navigation Kontrolleri
```typescript
// ✅ URL kontrolü
await expect(page).toHaveURL('/payment/tasks');

// ✅ URL pattern kontrolü
await expect(page).toHaveURL(/.*payment\/summary\/\d+/);

// ✅ Title kontrolü
await expect(page).toHaveTitle(/Ödeme Süreci/);
```

### Wait Strategies

#### Auto-Wait (Playwright Default)
```typescript
// Playwright otomatik bekler, manual wait GEREKSIZ
await page.click('#submit-button'); // Tıklanabilir olana kadar bekler
await page.fill('#username', 'test'); // Görünür olana kadar bekler
```

#### Explicit Wait (Gerektiğinde)
```typescript
// ✅ Belirli bir element için bekleme
await page.waitForSelector('#invoice-table', { state: 'visible' });

// ✅ Network isteği için bekleme
await page.waitForResponse(response =>
  response.url().includes('/api/Payment/OPCH') && response.status() === 200
);

// ✅ Navigation için bekleme
await page.waitForURL('**/payment/summary/**');

// ✅ Load state için bekleme
await page.waitForLoadState('networkidle');

// ⚠️ Timeout ile bekleme (son çare)
await page.waitForTimeout(2000); // Mümkünse kullanma
```

#### Custom Wait Functions
```typescript
// ✅ Element kaybolana kadar bekle
async function waitForElementToDisappear(page, selector) {
  await page.waitForSelector(selector, { state: 'hidden' });
}

// ✅ Text değişene kadar bekle
async function waitForTextChange(page, selector, expectedText) {
  await page.waitForFunction(
    ({ selector, text }) => {
      const element = document.querySelector(selector);
      return element && element.textContent.includes(text);
    },
    { selector, text: expectedText }
  );
}
```

### Error Handling

```typescript
test('should handle API errors gracefully', async ({ page }) => {
  // ✅ Try-catch ile hata yakalama
  try {
    await page.goto('/payment/summary/999999'); // Var olmayan ID

    // Hata mesajı görünmeli
    const errorMessage = page.locator('.error-toast');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Süreç bulunamadı');
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
});

test('should validate form before submission', async ({ page }) => {
  await page.click('#submit-button');

  // ✅ Validation hatalarını kontrol et
  const errors = page.locator('.validation-error');
  await expect(errors).toHaveCount(3);

  // ✅ Her bir hatayı ayrı ayrı kontrol et
  await expect(errors.nth(0)).toContainText('Vade başlangıç tarihi zorunlu');
  await expect(errors.nth(1)).toContainText('Vade bitiş tarihi zorunlu');
  await expect(errors.nth(2)).toContainText('Döviz türü seçilmeli');
});
```

### Test Data Management

```typescript
// ✅ Constants dosyası kullan
// tests/constants/testData.ts
export const TEST_USERS = {
  ADMIN: { username: 'hasanHelvali', password: 'Hasan6969+' },
  FINANS: { username: 'test', password: 'deneme' },
  IC_PIYASA: { username: 'icpiyasa.@mail.com', password: '1234' },
  DIS_PIYASA: { username: 'dispiyasa@mail.com', password: '1234' },
  FINANS_MUDURU: { username: 'finans.muduru@mail.com', password: '1234' },
  GENEL_MUDUR: { username: 'genel.mudur@mail.com', password: '1234' },
};

export const TEST_PROCESS = {
  PROCESS_ID: 'TEST-PROC-001',
  INVOICE_COUNT: 10,
  TOTAL_AMOUNT: 150000,
  CURRENCY: 'TRY',
};

// Test içinde kullanım
import { TEST_USERS } from './constants/testData';

test('should login as Finance User', async ({ page }) => {
  await loginPage.login(TEST_USERS.FINANS.username, TEST_USERS.FINANS.password);
});
```

---

## 🧪 Test Senaryoları

### 1. Login Modülü (Detaylı)

#### Test Suite Yapısı

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { TEST_USERS } from './constants/testData';

test.describe('Login Functionality Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  // Test case'ler aşağıda...
});
```

#### Test Case 1: Sayfa Görünüm Kontrolleri

```typescript
test('should display login page correctly', async ({ page }) => {
  // Sayfa yüklenme kontrolü
  expect(await loginPage.isLoaded()).toBeTruthy();

  // Logo kontrolleri
  await expect(loginPage.abLogo).toBeVisible();
  await expect(loginPage.ottocoolLogo).toBeVisible();

  // Başlık kontrolü
  await expect(loginPage.welcomeTitle).toBeVisible();
  await expect(loginPage.welcomeTitle).toContainText('Hoş Geldiniz');

  // Form elementleri kontrolleri
  await expect(loginPage.companyDropdown).toBeVisible();
  await expect(loginPage.usernameInput).toBeVisible();
  await expect(loginPage.passwordInput).toBeVisible();
  await expect(loginPage.loginButton).toBeVisible();
  await expect(loginPage.loginButton).toBeEnabled();
});
```

#### Test Case 2: Validasyon Testleri

```typescript
test('should show error when company is not selected', async ({ page }) => {
  // Şirket seçmeden login dene
  await loginPage.enterUsername('testuser');
  await loginPage.enterPassword('testpass');
  await loginPage.clickLoginButton();

  // Hata mesajı kontrolü
  await page.waitForTimeout(500);
  expect(await loginPage.isErrorMessageVisible()).toBeTruthy();

  const errorText = await loginPage.getErrorMessage();
  expect(errorText.toLowerCase()).toContain('şirket');
});

test('should show error when username is empty', async ({ page }) => {
  await loginPage.selectCompany('MOCK_SAP_DB');
  await loginPage.enterPassword('testpass');
  await loginPage.clickLoginButton();

  await page.waitForTimeout(500);
  expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
});

test('should show error when password is empty', async ({ page }) => {
  await loginPage.selectCompany('MOCK_SAP_DB');
  await loginPage.enterUsername('testuser');
  await loginPage.clickLoginButton();

  await page.waitForTimeout(500);
  expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
});
```

#### Test Case 3: Password Visibility Toggle

```typescript
test('should toggle password visibility', async ({ page }) => {
  await loginPage.enterPassword('testpassword');

  // Başlangıçta şifre gizli
  let passwordType = await loginPage.getPasswordInputType();
  expect(passwordType).toBe('password');

  // Görünürlüğü aç
  await loginPage.togglePasswordVisibility();
  passwordType = await loginPage.getPasswordInputType();
  expect(passwordType).toBe('text');

  // Tekrar kapat
  await loginPage.togglePasswordVisibility();
  passwordType = await loginPage.getPasswordInputType();
  expect(passwordType).toBe('password');
});
```

#### Test Case 4: Başarılı Login - Tüm Roller

```typescript
test('should login successfully as Admin', async ({ page }) => {
  await loginPage.login(
    'MOCK_SAP_DB',
    TEST_USERS.ADMIN.username,
    TEST_USERS.ADMIN.password
  );

  // Yönlendirme kontrolü
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const currentUrl = await loginPage.getCurrentUrl();
  expect(currentUrl).not.toContain('/login');

  // Kullanıcı adının görünürlüğü
  const userDisplay = page.locator('[data-testid="user-display"]');
  await expect(userDisplay).toContainText('hasanHelvali');
});

test('should login successfully as Finance User', async ({ page }) => {
  await loginPage.login(
    'MOCK_SAP_DB',
    TEST_USERS.FINANS.username,
    TEST_USERS.FINANS.password
  );

  await page.waitForLoadState('networkidle');

  // Task list'e yönlendirilmeli
  await expect(page).toHaveURL(/.*payment\/tasks/);
});

test('should login successfully as Finance Manager', async ({ page }) => {
  await loginPage.login(
    'MOCK_SAP_DB',
    TEST_USERS.FINANS_MUDURU.username,
    TEST_USERS.FINANS_MUDURU.password
  );

  await page.waitForLoadState('networkidle');

  // Task list'e yönlendirilmeli
  await expect(page).toHaveURL(/.*payment\/tasks/);
});

test('should login successfully as General Manager', async ({ page }) => {
  await loginPage.login(
    'MOCK_SAP_DB',
    TEST_USERS.GENEL_MUDUR.username,
    TEST_USERS.GENEL_MUDUR.password
  );

  await page.waitForLoadState('networkidle');

  // Task list'e yönlendirilmeli
  await expect(page).toHaveURL(/.*payment\/tasks/);
});
```

#### Test Case 5: Hatalı Giriş

```typescript
test('should show error with invalid credentials', async ({ page }) => {
  await loginPage.login('MOCK_SAP_DB', 'invaliduser', 'invalidpass');

  await page.waitForTimeout(2000);
  expect(await loginPage.isErrorMessageVisible()).toBeTruthy();

  const errorText = await loginPage.getErrorMessage();
  expect(errorText.toLowerCase()).toMatch(/kullanıcı|şifre|hatalı/);
});
```

#### Test Case 6: Enter Key Support

```typescript
test('should login with Enter key', async ({ page }) => {
  await loginPage.selectCompany('MOCK_SAP_DB');
  await loginPage.enterUsername(TEST_USERS.FINANS.username);
  await loginPage.enterPassword(TEST_USERS.FINANS.password);

  // Enter tuşu ile login
  await loginPage.loginWithEnter();

  await page.waitForLoadState('networkidle');

  const currentUrl = await loginPage.getCurrentUrl();
  expect(currentUrl).not.toContain('/login');
});
```

#### Test Case 7: Input Value Persistence

```typescript
test('should maintain input values after error', async ({ page }) => {
  const testUsername = 'testuser123';
  const testPassword = 'testpass123';

  await loginPage.selectCompany('MOCK_SAP_DB');
  await loginPage.enterUsername(testUsername);
  await loginPage.enterPassword(testPassword);
  await loginPage.clickLoginButton();

  // Hata sonrası değerlerin korunması
  await page.waitForTimeout(1000);
  expect(await loginPage.getUsernameValue()).toBe(testUsername);
  expect(await loginPage.getPasswordValue()).toBe(testPassword);
  expect(await loginPage.getSelectedCompany()).toBe('MOCK_SAP_DB');
});
```

#### Test Case 8: Error Message Clear

```typescript
test('should clear error message when user types', async ({ page }) => {
  // Hatalı login
  await loginPage.clickLoginButton();
  expect(await loginPage.isErrorMessageVisible()).toBeTruthy();

  // Şirket seç - hata kaybolmalı
  await loginPage.selectCompany('MOCK_SAP_DB');
  await page.waitForTimeout(500);

  const isErrorVisible = await loginPage.isErrorMessageVisible().catch(() => false);
  expect(isErrorVisible).toBeFalsy();
});
```

---

### 2. Ödeme Süreci - Aşama Bazlı Testler

#### Stage 1: Finans Kullanıcısı - Fatura Çekme ve Düzenleme

```typescript
// tests/payment-stage1.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { PaymentInfoFormPage } from './pages/PaymentInfoFormPage';
import { TEST_USERS } from './constants/testData';

test.describe('Payment Process - Stage 1 Tests', () => {
  let loginPage: LoginPage;
  let paymentInfoPage: PaymentInfoFormPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    paymentInfoPage = new PaymentInfoFormPage(page);

    // Finans kullanıcısı olarak login
    await loginPage.navigate();
    await loginPage.login(
      'MOCK_SAP_DB',
      TEST_USERS.FINANS.username,
      TEST_USERS.FINANS.password
    );

    await page.waitForURL('**/payment/tasks');
  });

  test('should display payment info form correctly', async ({ page }) => {
    // Form sayfasına git
    await paymentInfoPage.navigate();

    // Form elementlerinin görünürlüğü
    await expect(paymentInfoPage.formDateInput).toBeVisible();
    await expect(paymentInfoPage.paymentDateInput).toBeVisible();
    await expect(paymentInfoPage.currencyDropdown).toBeVisible();
    await expect(paymentInfoPage.dueDateStartInput).toBeVisible();
    await expect(paymentInfoPage.dueDateEndInput).toBeVisible();
    await expect(paymentInfoPage.fetchInvoicesButton).toBeVisible();
  });

  test('should fetch invoices from SAP', async ({ page }) => {
    await paymentInfoPage.navigate();

    // Form doldur
    await paymentInfoPage.selectCurrency('TRY');
    await paymentInfoPage.enterDueDateStart('01/01/2025');
    await paymentInfoPage.enterDueDateEnd('31/01/2025');
    await paymentInfoPage.enterPaymentDate('15/02/2025');

    // Faturaları çek
    await paymentInfoPage.clickFetchInvoices();

    // Loading spinner kontrolü
    await expect(page.locator('.spinner')).toBeVisible();
    await expect(page.locator('.spinner')).toBeHidden({ timeout: 10000 });

    // Fatura tablosu görünmeli
    await expect(paymentInfoPage.invoiceTable).toBeVisible();

    // En az 1 fatura olmalı
    const rows = paymentInfoPage.invoiceTableRows;
    await expect(rows).toHaveCount({ minimum: 1 });
  });

  test('should validate date range', async ({ page }) => {
    await paymentInfoPage.navigate();

    // Bitiş tarihi başlangıçtan küçük
    await paymentInfoPage.enterDueDateStart('31/01/2025');
    await paymentInfoPage.enterDueDateEnd('01/01/2025');
    await paymentInfoPage.clickFetchInvoices();

    // Hata mesajı kontrolü
    const errorMessage = page.locator('.validation-error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Bitiş tarihi başlangıç tarihinden büyük olmalıdır');
  });

  test('should edit payable amount inline', async ({ page }) => {
    // Faturaları çek
    await paymentInfoPage.navigate();
    await paymentInfoPage.fillFormAndFetchInvoices('TRY', '01/01/2025', '31/01/2025');

    // İlk satırdaki "Ödenecek Tutar" alanını düzenle
    const firstPayableAmountInput = paymentInfoPage.invoiceTableRows.first()
      .locator('input[data-testid="payable-amount"]');

    await firstPayableAmountInput.clear();
    await firstPayableAmountInput.fill('5000');
    await firstPayableAmountInput.blur(); // Focus'u kaybettir

    // Değer güncellenmiş olmalı
    await expect(firstPayableAmountInput).toHaveValue('5000');

    // Toplam ödeme tutarı güncellenmiş olmalı
    const totalAmount = page.locator('[data-testid="total-payable-amount"]');
    await expect(totalAmount).not.toContainText('0');
  });

  test('should soft delete selected invoices', async ({ page }) => {
    await paymentInfoPage.navigate();
    await paymentInfoPage.fillFormAndFetchInvoices('TRY', '01/01/2025', '31/01/2025');

    // İlk 3 faturayı seç
    const checkboxes = page.locator('input[type="checkbox"][data-testid="invoice-checkbox"]');
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();

    // Silme butonuna tıkla
    await page.click('button:has-text("Seçimleri Sil")');

    // Onay dialogu
    await page.click('button:has-text("Evet, Sil")');

    // Toast mesajı
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('3 fatura silindi');

    // Silinen satırlar gri olmalı veya gizlenmeli
    const deletedRows = page.locator('tr[data-deleted="true"]');
    await expect(deletedRows).toHaveCount(3);
  });

  test('should validate payable amount <= open balance', async ({ page }) => {
    await paymentInfoPage.navigate();
    await paymentInfoPage.fillFormAndFetchInvoices('TRY', '01/01/2025', '31/01/2025');

    // Açık bakiyeden fazla tutar gir
    const firstRow = paymentInfoPage.invoiceTableRows.first();
    const openBalance = await firstRow.locator('[data-testid="open-balance"]').textContent();
    const openBalanceValue = parseFloat(openBalance.replace(/[^0-9.]/g, ''));

    const payableAmountInput = firstRow.locator('input[data-testid="payable-amount"]');
    await payableAmountInput.clear();
    await payableAmountInput.fill(String(openBalanceValue + 1000)); // Fazla tutar
    await payableAmountInput.blur();

    // Validation hatası görünmeli
    const validationError = firstRow.locator('.validation-error');
    await expect(validationError).toBeVisible();
    await expect(validationError).toContainText('Ödenecek tutar açık bakiyeden fazla olamaz');
  });

  test('should navigate to summary after creating summary', async ({ page }) => {
    await paymentInfoPage.navigate();
    await paymentInfoPage.fillFormAndFetchInvoices('TRY', '01/01/2025', '31/01/2025');

    // Özet oluştur butonuna tıkla
    await page.click('button:has-text("Özet Oluştur")');

    // Summary sayfasına yönlendirilmeli
    await page.waitForURL(/.*payment\/summary\/\d+/);

    // Summary sayfası yüklenmiş olmalı
    const summaryTable = page.locator('[data-testid="summary-table"]');
    await expect(summaryTable).toBeVisible();
  });

  test('should NOT allow editing in summary page at Stage 1', async ({ page }) => {
    // Stage 1'de özet sayfasına git
    await page.goto('/payment/summary/TEST-PROC-001');

    // "Toplam Ödeme" alanı READ-ONLY olmalı
    const totalPayableInput = page.locator('input[data-testid="total-payable"]').first();
    await expect(totalPayableInput).toBeDisabled();
    // VEYA
    await expect(totalPayableInput).toHaveAttribute('readonly', '');
  });
});
```

#### Stage 2: Departman Müdürleri - Fatura Onayı

```typescript
// tests/payment-stage2.spec.ts
test.describe('Payment Process - Stage 2 Tests', () => {
  test.describe('İç Piyasa Müdürü', () => {
    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(
        'MOCK_SAP_DB',
        TEST_USERS.IC_PIYASA.username,
        TEST_USERS.IC_PIYASA.password
      );
    });

    test('should see only own assignments', async ({ page }) => {
      // Task list'e git
      await page.goto('/payment/tasks');

      // Sadece İç Piyasa görevleri görünmeli
      const tasks = page.locator('[data-testid="task-item"]');
      await expect(tasks).toHaveCount({ minimum: 1 });

      // Her görevin "İç Piyasa" departmanı olmalı
      const departmentLabels = page.locator('[data-testid="task-department"]');
      for (let i = 0; i < await departmentLabels.count(); i++) {
        const text = await departmentLabels.nth(i).textContent();
        expect(text).toContain('İç Piyasa');
      }
    });

    test('should approve invoices', async ({ page }) => {
      // Göreve git
      await page.goto('/payment/summary/TEST-PROC-001?stage=2');

      // Faturaları incele
      const summaryTable = page.locator('[data-testid="summary-table"]');
      await expect(summaryTable).toBeVisible();

      // "Toplam Ödeme" alanını düzenleyebilmeli
      const totalPayableInput = page.locator('input[data-testid="total-payable"]').first();
      await expect(totalPayableInput).toBeEnabled();

      await totalPayableInput.clear();
      await totalPayableInput.fill('10000');

      // Detay popup açabilmeli
      await page.click('button[data-testid="detail-button"]');
      const detailDialog = page.locator('[role="dialog"]');
      await expect(detailDialog).toBeVisible();

      // Detay popup'ta düzenleme yapabilmeli
      const detailPayableInput = detailDialog.locator('input[data-testid="payable-amount"]').first();
      await detailPayableInput.clear();
      await detailPayableInput.fill('5000');

      // Popup'ı kapat
      await page.click('button:has-text("Kapat")');

      // Onay butonu
      await page.click('button:has-text("Onayla")');

      // Toast mesajı
      const toast = page.locator('.toast');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('onaylandı');

      // Görev listesinden düşmeli
      await page.goto('/payment/tasks');
      const taskItem = page.locator(`[data-process-id="TEST-PROC-001"]`);
      await expect(taskItem).toHaveCount(0);
    });
  });

  test.describe('Dış Piyasa Müdürü', () => {
    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(
        'MOCK_SAP_DB',
        TEST_USERS.DIS_PIYASA.username,
        TEST_USERS.DIS_PIYASA.password
      );
    });

    test('should see only own assignments', async ({ page }) => {
      await page.goto('/payment/tasks');

      // Sadece Dış Piyasa görevleri görünmeli
      const departmentLabels = page.locator('[data-testid="task-department"]');
      for (let i = 0; i < await departmentLabels.count(); i++) {
        const text = await departmentLabels.nth(i).textContent();
        expect(text).toContain('Dış Piyasa');
      }
    });
  });

  test('should require BOTH managers to approve before Stage 3', async ({ page }) => {
    // İç Piyasa onaylasın
    const icPiyasaLogin = new LoginPage(page);
    await icPiyasaLogin.navigate();
    await icPiyasaLogin.login(
      'MOCK_SAP_DB',
      TEST_USERS.IC_PIYASA.username,
      TEST_USERS.IC_PIYASA.password
    );

    await page.goto('/payment/summary/TEST-PROC-001?stage=2');
    await page.click('button:has-text("Onayla")');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('button:has-text("Çıkış")');

    // Dış Piyasa login
    await icPiyasaLogin.navigate();
    await icPiyasaLogin.login(
      'MOCK_SAP_DB',
      TEST_USERS.DIS_PIYASA.username,
      TEST_USERS.DIS_PIYASA.password
    );

    // Hala Stage 2'de olmalı
    await page.goto('/payment/summary/TEST-PROC-001');
    const stage = page.locator('[data-testid="current-stage"]');
    await expect(stage).toContainText('Aşama 2');

    // Dış Piyasa onaylasın
    await page.click('button:has-text("Onayla")');

    // Şimdi Stage 3'e geçmeli
    await page.waitForTimeout(2000);
    const newStage = page.locator('[data-testid="current-stage"]');
    await expect(newStage).toContainText('Aşama 3');
  });
});
```

#### Stage 3: Finans Kullanıcısı - Ekstre Yükleme

```typescript
// tests/payment-stage3.spec.ts
test.describe('Payment Process - Stage 3 Tests', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(
      'MOCK_SAP_DB',
      TEST_USERS.FINANS.username,
      TEST_USERS.FINANS.password
    );
  });

  test('should upload statement for each vendor', async ({ page }) => {
    await page.goto('/payment/summary/TEST-PROC-001?stage=3');

    // İlk cari için ekstre yükle
    const uploadButton = page.locator('button[data-testid="upload-statement"]').first();
    await uploadButton.click();

    // File input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/sample-statement.pdf');

    // Yükleme başarılı mesajı
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Ekstre yüklendi');

    // Upload butonu "Görüntüle" butonuna dönüşmeli
    const viewButton = page.locator('button:has-text("Görüntüle")').first();
    await expect(viewButton).toBeVisible();

    // Satır rengi yeşil olmalı
    const row = page.locator('tr[data-vendor="V00001"]');
    await expect(row).toHaveClass(/bg-green-50/);
  });

  test('should NOT proceed without uploading all statements', async ({ page }) => {
    await page.goto('/payment/summary/TEST-PROC-001?stage=3');

    // Sadece 1 ekstre yükle (2 cari varsa)
    const uploadButton = page.locator('button[data-testid="upload-statement"]').first();
    await uploadButton.click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/sample-statement.pdf');

    // Onaya gönder butonuna tıkla
    await page.click('button:has-text("Onaya Gönder")');

    // Validation hatası
    const errorDialog = page.locator('[role="alertdialog"]');
    await expect(errorDialog).toBeVisible();
    await expect(errorDialog).toContainText('Tüm cariler için ekstre yüklemelisiniz');
  });

  test('should allow editing in summary at Stage 3', async ({ page }) => {
    await page.goto('/payment/summary/TEST-PROC-001?stage=3');

    // "Toplam Ödeme" alanı editable olmalı (Stage 1'de değildi)
    const totalPayableInput = page.locator('input[data-testid="total-payable"]').first();
    await expect(totalPayableInput).toBeEnabled();

    // Düzenleme yapabilmeli
    await totalPayableInput.clear();
    await totalPayableInput.fill('12000');
    await expect(totalPayableInput).toHaveValue('12000');
  });

  test('should view uploaded statement', async ({ page }) => {
    await page.goto('/payment/summary/TEST-PROC-001?stage=3');

    // Ekstre yüklenmiş bir satırda "Görüntüle" butonuna tıkla
    await page.click('button[data-testid="view-statement"]:visible').first();

    // Yeni tab açılmalı veya PDF viewer gösterilmeli
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.click('button[data-testid="view-statement"]:visible').first()
    ]);

    // PDF URL'i olmalı
    expect(newPage.url()).toContain('.pdf');
  });

  test('should delete uploaded statement', async ({ page }) => {
    await page.goto('/payment/summary/TEST-PROC-001?stage=3');

    // Silme butonuna tıkla
    await page.click('button[data-testid="delete-statement"]:visible').first();

    // Onay dialogu
    await page.click('button:has-text("Evet, Sil")');

    // Toast mesajı
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Ekstre silindi');

    // Upload butonu tekrar görünmeli
    const uploadButton = page.locator('button[data-testid="upload-statement"]').first();
    await expect(uploadButton).toBeVisible();
  });
});
```

#### Stage 4: Finans Müdürü - İnceleme ve Onay/Geri Atama

```typescript
// tests/payment-stage4.spec.ts
test.describe('Payment Process - Stage 4 Tests', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(
      'MOCK_SAP_DB',
      TEST_USERS.FINANS_MUDURU.username,
      TEST_USERS.FINANS_MUDURU.password
    );
  });

  test('should review and approve process', async ({ page }) => {
    await page.goto('/payment/summary/TEST-PROC-001?stage=4');

    // Ekstre kontrolü
    const viewStatementButtons = page.locator('button[data-testid="view-statement"]');
    const statementCount = await viewStatementButtons.count();
    expect(statementCount).toBeGreaterThan(0);

    // Toplam ödeme düzenlenebilmeli
    const totalPayableInput = page.locator('input[data-testid="total-payable"]').first();
    await totalPayableInput.clear();
    await totalPayableInput.fill('15000');

    // Süreç notu ekle
    await page.fill('textarea[data-testid="process-notes"]', 'Finans müdürü onayı - Her şey uygun görünüyor');

    // Onaya gönder
    await page.click('button:has-text("Onaya Gönder")');

    // Toast mesajı
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Aşama 5\'e gönderildi');

    // Stage 5'e geçmiş olmalı
    await page.reload();
    const stage = page.locator('[data-testid="current-stage"]');
    await expect(stage).toContainText('Aşama 5');
  });

  test('should reject and send back to Stage 3', async ({ page }) => {
    await page.goto('/payment/summary/TEST-PROC-001?stage=4');

    // Geri atama butonuna tıkla
    await page.click('button:has-text("Geri Ata")');

    // Dialog açılmalı
    const rejectDialog = page.locator('[role="dialog"]');
    await expect(rejectDialog).toBeVisible();

    // Red sebebi gir
    await page.fill('textarea[data-testid="reject-reason"]', 'Ekstre hatalı, düzeltilmeli');

    // Onayla
    await page.click('button:has-text("Geri Gönder")');

    // Toast mesajı
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Aşama 3\'e geri gönderildi');

    // Stage 3'e dönmüş olmalı
    await page.reload();
    const stage = page.locator('[data-testid="current-stage"]');
    await expect(stage).toContainText('Aşama 3');

    // Finans kullanıcısının görev listesinde görünmeli
    await page.goto('/payment/tasks');
    // Logout ve Finans kullanıcısı login
    await page.click('[data-testid="user-menu"]');
    await page.click('button:has-text("Çıkış")');

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(
      'MOCK_SAP_DB',
      TEST_USERS.FINANS.username,
      TEST_USERS.FINANS.password
    );

    await page.goto('/payment/tasks');
    const taskItem = page.locator(`[data-process-id="TEST-PROC-001"]`);
    await expect(taskItem).toBeVisible();
    await expect(taskItem).toContainText('Aşama 3'); // Stage 3 görevi
  });

  test('should cancel Stage 4 task when rejected to Stage 3', async ({ page }) => {
    // Geri atama yap
    await page.goto('/payment/summary/TEST-PROC-001?stage=4');
    await page.click('button:has-text("Geri Ata")');
    await page.fill('textarea[data-testid="reject-reason"]', 'Test rejection');
    await page.click('button:has-text("Geri Gönder")');

    // Finans Müdürü'nün görev listesinde artık olmamalı
    await page.goto('/payment/tasks');
    const stage4Task = page.locator(`[data-process-id="TEST-PROC-001"][data-stage="4"]`);
    await expect(stage4Task).toHaveCount(0);
  });
});
```

#### Stage 5: Genel Müdür - Nihai Onay

```typescript
// tests/payment-stage5.spec.ts
test.describe('Payment Process - Stage 5 Tests', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(
      'MOCK_SAP_DB',
      TEST_USERS.GENEL_MUDUR.username,
      TEST_USERS.GENEL_MUDUR.password
    );
  });

  test('should give final approval', async ({ page }) => {
    await page.goto('/payment/summary/TEST-PROC-001?stage=5');

    // Tüm detayları incele
    await page.click('button[data-testid="detail-button"]').first();
    const detailDialog = page.locator('[role="dialog"]');
    await expect(detailDialog).toBeVisible();
    await page.click('button:has-text("Kapat")');

    // Ekstre kontrolü
    await page.click('button[data-testid="view-statement"]').first();

    // Süreç notu ekle
    await page.fill('textarea[data-testid="process-notes"]', 'Genel müdür nihai onayı');

    // "Onayla" butonuna tıkla (Stage 5'te "Onaya Gönder" değil "Onayla")
    await page.click('button:has-text("Onayla")');

    // Onay dialogu
    const confirmDialog = page.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog).toContainText('Nihai onay');

    await page.click('button:has-text("Evet, Onayla")');

    // Toast mesajı
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Süreç onaylandı');

    // Stage 6'ya geçmiş olmalı
    await page.reload();
    const stage = page.locator('[data-testid="current-stage"]');
    await expect(stage).toContainText('Aşama 6');
  });

  test('should reject and send back to Stage 4', async ({ page }) => {
    await page.goto('/payment/summary/TEST-PROC-001?stage=5');

    // Geri atama
    await page.click('button:has-text("Geri Ata")');
    await page.fill('textarea[data-testid="reject-reason"]', 'Toplam tutar yüksek, tekrar incelenmeli');
    await page.click('button:has-text("Geri Gönder")');

    // Toast
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Aşama 4\'e geri gönderildi');

    // Stage 4'e dönmüş olmalı
    await page.reload();
    const stage = page.locator('[data-testid="current-stage"]');
    await expect(stage).toContainText('Aşama 4');
  });

  test('should send email to Finance User after approval', async ({ page }) => {
    // Email gönderimi backend'de yapılır, UI'da kontrol edemeyiz
    // Ancak log'larda veya notification'larda kontrol edilebilir

    await page.goto('/payment/summary/TEST-PROC-001?stage=5');
    await page.click('button:has-text("Onayla")');
    await page.click('button:has-text("Evet, Onayla")');

    // Notification/toast kontrolü
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();

    // Email gönderildi mesajı (varsa)
    await expect(toast).toContainText(/onaylandı.*mail/i);
  });
});
```

#### Stage 6: Talimat Oluşturma (READ-ONLY)

```typescript
// tests/payment-stage6.spec.ts
test.describe('Payment Process - Stage 6 Tests', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(
      'MOCK_SAP_DB',
      TEST_USERS.FINANS.username,
      TEST_USERS.FINANS.password
    );
  });

  test('should display all fields as READ-ONLY', async ({ page }) => {
    await page.goto('/payment/summary/TEST-PROC-001?stage=6');

    // Tüm input alanları disabled olmalı
    const totalPayableInputs = page.locator('input[data-testid="total-payable"]');
    for (let i = 0; i < await totalPayableInputs.count(); i++) {
      await expect(totalPayableInputs.nth(i)).toBeDisabled();
    }

    // Ekstre yükleme butonları gizli olmalı
    const uploadButtons = page.locator('button[data-testid="upload-statement"]');
    await expect(uploadButtons).toHaveCount(0);

    // Süreç notları disabled olmalı
    const notesTextarea = page.locator('textarea[data-testid="process-notes"]');
    await expect(notesTextarea).toBeDisabled();

    // Sadece "Görüntüle" butonları olmalı (silme/yükleme yok)
    const viewButtons = page.locator('button[data-testid="view-statement"]');
    await expect(viewButtons.first()).toBeVisible();
  });

  test('should NOT allow editing in detail popup', async ({ page }) => {
    await page.goto('/payment/summary/TEST-PROC-001?stage=6');

    // Detay popup aç
    await page.click('button[data-testid="detail-button"]').first();

    const detailDialog = page.locator('[role="dialog"]');
    await expect(detailDialog).toBeVisible();

    // Popup içindeki input'lar disabled olmalı
    const payableAmountInputs = detailDialog.locator('input[data-testid="payable-amount"]');
    for (let i = 0; i < await payableAmountInputs.count(); i++) {
      await expect(payableAmountInputs.nth(i)).toBeDisabled();
    }

    // Silme butonları olmamalı
    const deleteButtons = detailDialog.locator('button:has-text("Sil")');
    await expect(deleteButtons).toHaveCount(0);
  });

  test('should create payment instruction (Excel)', async ({ page }) => {
    await page.goto('/payment/instruction/TEST-PROC-001');

    // Talimat oluştur butonu görünmeli
    const createInstructionButton = page.locator('button:has-text("Talimat Oluştur")');
    await expect(createInstructionButton).toBeVisible();
    await expect(createInstructionButton).toBeEnabled();

    // Talimat oluştur
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      createInstructionButton.click()
    ]);

    // Excel dosyası indirilmeli
    expect(download.suggestedFilename()).toMatch(/Odeme_Talimati.*\.xlsx/);

    // Toast mesajı
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Talimat oluşturuldu');
  });

  test('should move to completed after instruction creation', async ({ page }) => {
    await page.goto('/payment/instruction/TEST-PROC-001');

    // Talimat oluştur
    await page.click('button:has-text("Talimat Oluştur")');
    await page.waitForEvent('download');

    // Toast'ta tamamlandı mesajı
    const toast = page.locator('.toast');
    await expect(toast).toContainText('tamamlandı');

    // Görev listesinden düşmeli
    await page.goto('/payment/tasks');
    const taskItem = page.locator(`[data-process-id="TEST-PROC-001"]`);
    await expect(taskItem).toHaveCount(0);

    // Tamamlanan süreçlerde görünmeli
    await page.goto('/payment/completed');
    const completedItem = page.locator(`[data-process-id="TEST-PROC-001"]`);
    await expect(completedItem).toBeVisible();
  });
});
```

---

### 3. Görev Listesi (Task Management)

```typescript
// tests/task-management.spec.ts
test.describe('Task Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(
      'MOCK_SAP_DB',
      TEST_USERS.FINANS.username,
      TEST_USERS.FINANS.password
    );
  });

  test('should display task list', async ({ page }) => {
    await page.goto('/payment/tasks');

    // Tablo görünmeli
    const taskTable = page.locator('[data-testid="task-table"]');
    await expect(taskTable).toBeVisible();

    // En az 1 görev olmalı (varsa)
    const tasks = page.locator('[data-testid="task-item"]');
    const taskCount = await tasks.count();
    console.log(`Task count: ${taskCount}`);
  });

  test('should filter tasks by process type', async ({ page }) => {
    await page.goto('/payment/tasks');

    // "Ödeme Süreci" filtresi seç
    await page.selectOption('[data-testid="filter-process-type"]', 'Ödeme Süreci');

    // Tüm görevler "Ödeme Süreci" olmalı
    const processTags = page.locator('[data-testid="task-process-type"]');
    for (let i = 0; i < await processTags.count(); i++) {
      await expect(processTags.nth(i)).toContainText('Ödeme');
    }
  });

  test('should filter tasks by stage', async ({ page }) => {
    await page.goto('/payment/tasks');

    // "Aşama 3" filtresi seç
    await page.selectOption('[data-testid="filter-stage"]', '3');

    // Tüm görevler "Aşama 3" olmalı
    const stageTags = page.locator('[data-testid="task-stage"]');
    for (let i = 0; i < await stageTags.count(); i++) {
      await expect(stageTags.nth(i)).toContainText('Aşama 3');
    }
  });

  test('should navigate to task', async ({ page }) => {
    await page.goto('/payment/tasks');

    // İlk göreve git
    const firstTaskButton = page.locator('button:has-text("Göreve Git")').first();
    await firstTaskButton.click();

    // İlgili sayfaya yönlendirilmeli
    await expect(page).toHaveURL(/.*payment\/(summary|invoices|instruction)/);
  });

  test('should show task count', async ({ page }) => {
    await page.goto('/payment/tasks');

    // Toplam görev sayısı gösterilmeli
    const taskCount = page.locator('[data-testid="task-count"]');
    await expect(taskCount).toBeVisible();
    await expect(taskCount).toContainText(/\d+/); // Bir sayı içermeli
  });
});
```

---

## 📚 Page Object Pattern Örnekleri

### BasePage.ts

```typescript
// tests/pages/BasePage.ts
import { Page } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(url: string) {
    await this.page.goto(url);
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }
}
```

### LoginPage.ts

```typescript
// tests/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Locators
  readonly companyDropdown: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordToggle: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly abLogo: Locator;
  readonly ottocoolLogo: Locator;
  readonly welcomeTitle: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.companyDropdown = page.locator('[data-testid="company-dropdown"]');
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.passwordToggle = page.locator('button[data-testid="password-toggle"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.abLogo = page.locator('img[alt="Anadolu Bakır"]');
    this.ottocoolLogo = page.locator('img[alt="Ottocool"]');
    this.welcomeTitle = page.locator('h1');
  }

  async navigate() {
    await this.page.goto('/login');
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.loginButton.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async selectCompany(companyName: string) {
    await this.companyDropdown.click();
    await this.page.locator(`text="${companyName}"`).click();
  }

  async enterUsername(username: string) {
    await this.usernameInput.clear();
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string) {
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
  }

  async clickLoginButton() {
    await this.loginButton.click();
  }

  async togglePasswordVisibility() {
    await this.passwordToggle.click();
  }

  async login(company: string, username: string, password: string) {
    await this.selectCompany(company);
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  async loginWithEnter() {
    await this.passwordInput.press('Enter');
  }

  async isErrorMessageVisible(): Promise<boolean> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 2000 });
      return await this.errorMessage.isVisible();
    } catch {
      return false;
    }
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async getPasswordInputType(): Promise<string> {
    return await this.passwordInput.getAttribute('type') || '';
  }

  async getUsernameValue(): Promise<string> {
    return await this.usernameInput.inputValue();
  }

  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  async getSelectedCompany(): Promise<string> {
    return await this.companyDropdown.textContent() || '';
  }

  async hasCompanyOption(companyName: string): Promise<boolean> {
    await this.companyDropdown.click();
    const option = this.page.locator(`text="${companyName}"`);
    const exists = await option.count() > 0;
    await this.companyDropdown.click(); // Close dropdown
    return exists;
  }

  async getCompanyOptionsCount(): Promise<number> {
    await this.companyDropdown.click();
    const options = this.page.locator('[role="option"]');
    const count = await options.count();
    await this.companyDropdown.click(); // Close dropdown
    return count;
  }
}
```

### PaymentInfoFormPage.ts

```typescript
// tests/pages/PaymentInfoFormPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class PaymentInfoFormPage extends BasePage {
  readonly formDateInput: Locator;
  readonly paymentDateInput: Locator;
  readonly currencyDropdown: Locator;
  readonly dueDateStartInput: Locator;
  readonly dueDateEndInput: Locator;
  readonly fetchInvoicesButton: Locator;
  readonly invoiceTable: Locator;
  readonly invoiceTableRows: Locator;
  readonly createSummaryButton: Locator;

  constructor(page: Page) {
    super(page);

    this.formDateInput = page.locator('input[data-testid="form-date"]');
    this.paymentDateInput = page.locator('input[data-testid="payment-date"]');
    this.currencyDropdown = page.locator('[data-testid="currency-dropdown"]');
    this.dueDateStartInput = page.locator('input[data-testid="due-date-start"]');
    this.dueDateEndInput = page.locator('input[data-testid="due-date-end"]');
    this.fetchInvoicesButton = page.locator('button:has-text("Listeyi Çek")');
    this.invoiceTable = page.locator('[data-testid="invoice-table"]');
    this.invoiceTableRows = this.invoiceTable.locator('tbody tr');
    this.createSummaryButton = page.locator('button:has-text("Özet Oluştur")');
  }

  async navigate() {
    await this.page.goto('/payment/invoices/new');
  }

  async selectCurrency(currency: string) {
    await this.currencyDropdown.click();
    await this.page.locator(`text="${currency}"`).click();
  }

  async enterDueDateStart(date: string) {
    await this.dueDateStartInput.fill(date);
  }

  async enterDueDateEnd(date: string) {
    await this.dueDateEndInput.fill(date);
  }

  async enterPaymentDate(date: string) {
    await this.paymentDateInput.fill(date);
  }

  async clickFetchInvoices() {
    await this.fetchInvoicesButton.click();
  }

  async fillFormAndFetchInvoices(currency: string, startDate: string, endDate: string) {
    await this.selectCurrency(currency);
    await this.enterDueDateStart(startDate);
    await this.enterDueDateEnd(endDate);
    await this.enterPaymentDate(endDate); // Default to end date
    await this.clickFetchInvoices();

    // Wait for table to load
    await this.invoiceTable.waitFor({ state: 'visible', timeout: 10000 });
  }

  async getInvoiceCount(): Promise<number> {
    return await this.invoiceTableRows.count();
  }

  async getTotalPayableAmount(): Promise<string> {
    const totalElement = this.page.locator('[data-testid="total-payable-amount"]');
    return await totalElement.textContent() || '0';
  }
}
```

### PaymentSummaryPage.ts

```typescript
// tests/pages/PaymentSummaryPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class PaymentSummaryPage extends BasePage {
  readonly summaryTable: Locator;
  readonly summaryTableRows: Locator;
  readonly processNotes: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly currentStageIndicator: Locator;

  constructor(page: Page) {
    super(page);

    this.summaryTable = page.locator('[data-testid="summary-table"]');
    this.summaryTableRows = this.summaryTable.locator('tbody tr');
    this.processNotes = page.locator('textarea[data-testid="process-notes"]');
    this.approveButton = page.locator('button:has-text("Onaya Gönder"), button:has-text("Onayla")');
    this.rejectButton = page.locator('button:has-text("Geri Ata")');
    this.currentStageIndicator = page.locator('[data-testid="current-stage"]');
  }

  async navigate(processId: string, stage?: number) {
    const url = stage
      ? `/payment/summary/${processId}?stage=${stage}`
      : `/payment/summary/${processId}`;
    await this.page.goto(url);
  }

  async uploadStatement(vendorCode: string, filePath: string) {
    const row = this.page.locator(`tr[data-vendor="${vendorCode}"]`);
    const uploadButton = row.locator('button[data-testid="upload-statement"]');

    await uploadButton.click();

    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  async viewStatement(vendorCode: string) {
    const row = this.page.locator(`tr[data-vendor="${vendorCode}"]`);
    const viewButton = row.locator('button[data-testid="view-statement"]');
    await viewButton.click();
  }

  async openDetailPopup(vendorCode: string) {
    const row = this.page.locator(`tr[data-vendor="${vendorCode}"]`);
    const detailButton = row.locator('button[data-testid="detail-button"]');
    await detailButton.click();
  }

  async editTotalPayable(vendorCode: string, amount: string) {
    const row = this.page.locator(`tr[data-vendor="${vendorCode}"]`);
    const input = row.locator('input[data-testid="total-payable"]');

    await input.clear();
    await input.fill(amount);
    await input.blur();
  }

  async enterProcessNotes(notes: string) {
    await this.processNotes.clear();
    await this.processNotes.fill(notes);
  }

  async clickApprove() {
    await this.approveButton.click();
  }

  async clickReject() {
    await this.rejectButton.click();
  }

  async getCurrentStage(): Promise<string> {
    return await this.currentStageIndicator.textContent() || '';
  }

  async getVendorCount(): Promise<number> {
    return await this.summaryTableRows.count();
  }
}
```

### PaymentTaskListPage.ts

```typescript
// tests/pages/PaymentTaskListPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class PaymentTaskListPage extends BasePage {
  readonly taskTable: Locator;
  readonly taskItems: Locator;
  readonly filterProcessType: Locator;
  readonly filterStage: Locator;
  readonly taskCount: Locator;

  constructor(page: Page) {
    super(page);

    this.taskTable = page.locator('[data-testid="task-table"]');
    this.taskItems = page.locator('[data-testid="task-item"]');
    this.filterProcessType = page.locator('[data-testid="filter-process-type"]');
    this.filterStage = page.locator('[data-testid="filter-stage"]');
    this.taskCount = page.locator('[data-testid="task-count"]');
  }

  async navigate() {
    await this.page.goto('/payment/tasks');
  }

  async filterByProcessType(processType: string) {
    await this.filterProcessType.selectOption(processType);
  }

  async filterByStage(stage: string) {
    await this.filterStage.selectOption(stage);
  }

  async goToTask(processId: string) {
    const taskRow = this.page.locator(`[data-process-id="${processId}"]`);
    const goToButton = taskRow.locator('button:has-text("Göreve Git")');
    await goToButton.click();
  }

  async getTaskCount(): Promise<number> {
    return await this.taskItems.count();
  }

  async getTaskCountText(): Promise<string> {
    return await this.taskCount.textContent() || '0';
  }
}
```

---

## 🔌 Backend Bağımsızlığı ve Test Stratejisi

### UI Bazlı Test Yaklaşımı

Bu projede **UI-first testing** yaklaşımı benimsenmiştir. Yani test senaryoları:

- ✅ **Gerçek backend** ile çalışır (mock-free)
- ✅ **UI elementleri** üzerinden kontrol yapar
- ✅ **E2E test** prensiplerine uyar
- ❌ Backend API'yi doğrudan test etmez (bu API test'in görevi)

### Test Piramidi

```
           /\
          /  \
         / E2E\      <- Playwright ile bu katman
        /______\
       /        \
      / API Test \   <- Backend test
     /____________\
    /              \
   /   Unit Tests   \  <- Backend + Frontend unit test
  /__________________\
```

### Backend Farkları Nasıl Handle Edilir?

#### 1. Data-Testid Kullanımı

UI elementlerine `data-testid` attribute'ları ekleyerek, backend değişikliklerinden bağımsız locator'lar oluşturun:

```tsx
// React Component
<button data-testid="approve-button" onClick={handleApprove}>
  Onayla
</button>

// Test
await page.click('[data-testid="approve-button"]');
```

#### 2. Environment Variables

Farklı environment'larda farklı URL'ler kullanın:

```typescript
// playwright.config.ts
use: {
  baseURL: process.env.BASE_URL || 'http://167.16.21.50:81/',
}

// .env.test
BASE_URL=http://167.16.21.50:81/

// .env.staging
BASE_URL=https://staging.example.com/

// .env.production
BASE_URL=https://example.com/
```

#### 3. API Response Mocking (Opsiyonel)

Bazı durumlarda API response'larını mock edebilirsiniz:

```typescript
test('should handle API error gracefully', async ({ page }) => {
  // API response'u mock et
  await page.route('**/api/Payment/OPCH*', route => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    });
  });

  await page.goto('/payment/invoices/new');
  await page.click('button:has-text("Listeyi Çek")');

  // Hata mesajı gösterilmeli
  const errorMessage = page.locator('.error-toast');
  await expect(errorMessage).toBeVisible();
});
```

#### 4. Wait for API Calls

Backend yanıt süresi değişken olabilir, bu nedenle dinamik wait kullanın:

```typescript
test('should wait for invoices to load', async ({ page }) => {
  await page.click('button:has-text("Listeyi Çek")');

  // API yanıtını bekle
  await page.waitForResponse(
    response => response.url().includes('/api/Payment/OPCH') && response.status() === 200,
    { timeout: 30000 }
  );

  // Tablo yüklenene kadar bekle
  await page.waitForSelector('[data-testid="invoice-table"]', { state: 'visible', timeout: 10000 });
});
```

---

## 🐛 Debugging ve Troubleshooting

### Debug Modu

#### 1. Headed Mode
```bash
npm run test:headed
```
Tarayıcı görünür şekilde açılır, test adımlarını görebilirsiniz.

#### 2. UI Mode (Interaktif)
```bash
npm run test:ui
```
Playwright'ın UI mode'u açılır:
- Test'leri step-by-step çalıştırabilirsiniz
- Her adımda durabilirsiniz
- DOM'u inspect edebilirsiniz

#### 3. Debug Mode
```bash
npm run test:debug
```
Debugger ile test'i adım adım çalıştırabilirsiniz.

#### 4. Specific Test Debug
```bash
npx playwright test tests/login.spec.ts --debug
```

### Playwright Inspector

Test çalışırken Inspector açmak için:

```typescript
test('my test', async ({ page }) => {
  await page.pause(); // Inspector açılır, test durur

  // ... test devamı
});
```

### Screenshot ve Video

#### Otomatik Screenshot (Hata Durumunda)
```typescript
// playwright.config.ts
use: {
  screenshot: 'only-on-failure',
}
```

#### Manuel Screenshot
```typescript
test('take screenshot', async ({ page }) => {
  await page.goto('/payment/summary/123');
  await page.screenshot({ path: 'screenshots/summary.png', fullPage: true });
});
```

#### Video Recording
```typescript
// playwright.config.ts
use: {
  video: 'retain-on-failure',
}
```

### Trace Viewer

Trace otomatik olarak hatalı test'lerde kaydedilir:

```typescript
// playwright.config.ts
use: {
  trace: 'on-first-retry',
}
```

Trace dosyasını görüntülemek için:
```bash
npx playwright show-trace test-results/.../trace.zip
```

### Common Issues

#### Issue 1: Element Not Found
```
Error: locator.click: Target closed
```

**Çözüm:**
```typescript
// ❌ Yanlış
await page.click('#button');

// ✅ Doğru - waitFor ile
await page.locator('#button').waitFor({ state: 'visible' });
await page.click('#button');

// VEYA
// ✅ Daha iyi - Playwright otomatik bekler
await page.click('#button', { timeout: 10000 });
```

#### Issue 2: Timeout Errors
```
Error: page.waitForSelector: Timeout 30000ms exceeded
```

**Çözüm:**
```typescript
// Timeout süresini artır
await page.waitForSelector('#element', { timeout: 60000 });

// Network idle bekle
await page.waitForLoadState('networkidle');

// Daha spesifik selector kullan
await page.waitForSelector('[data-testid="invoice-table"]');
```

#### Issue 3: Flaky Tests
Test bazen başarılı, bazen başarısız oluyor.

**Çözüm:**
```typescript
// 1. Hard-coded wait'leri kaldır
// ❌
await page.waitForTimeout(2000);

// ✅
await page.waitForSelector('#element', { state: 'visible' });

// 2. Retry stratejisi
// playwright.config.ts
retries: process.env.CI ? 2 : 0,

// 3. beforeEach'te state'i temizle
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  // Her test temiz başlasın
});
```

### Logging

```typescript
test('with logging', async ({ page }) => {
  // Console log'ları yakala
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Network isteklerini log'la
  page.on('request', request => console.log('>>', request.method(), request.url()));
  page.on('response', response => console.log('<<', response.status(), response.url()));

  // Test...
});
```

---

## 🚀 CI/CD Entegrasyonu

### GitHub Actions

`.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npm run test
        env:
          BASE_URL: ${{ secrets.TEST_BASE_URL }}

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
          retention-days: 30
```

### GitLab CI

`.gitlab-ci.yml`:

```yaml
stages:
  - test

playwright:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  script:
    - npm ci
    - npx playwright install
    - npm run test
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    expire_in: 1 week
  only:
    - main
    - develop
```

### Docker

`Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "run", "test"]
```

```bash
# Build
docker build -t payment-tests .

# Run
docker run -e BASE_URL=http://167.16.21.50:81/ payment-tests
```

---

## 📊 Test Coverage ve Raporlama

### HTML Report

Test sonrası otomatik HTML report oluşur:

```bash
npm run test
npm run test:report
```

Report şunları içerir:
- ✅ Başarılı test sayısı
- ❌ Başarısız test sayısı
- ⏱️ Test süreleri
- 📸 Screenshot'lar (hatalı test'ler için)
- 🎥 Video'lar (hatalı test'ler için)
- 📜 Trace dosyaları

### JSON Report

```typescript
// playwright.config.ts
reporter: [
  ['json', { outputFile: 'test-results/results.json' }]
]
```

JSON report'u CI/CD pipeline'ında kullanabilirsiniz.

### Custom Reporter

```typescript
// my-reporter.ts
import { Reporter } from '@playwright/test/reporter';

class MyReporter implements Reporter {
  onTestEnd(test, result) {
    console.log(`Test ${test.title}: ${result.status}`);
  }
}

export default MyReporter;
```

```typescript
// playwright.config.ts
reporter: [['./my-reporter.ts']]
```

---

## 🎓 Best Practices Özeti

### DO ✅

1. **Page Object Pattern kullan**
   - Test kodunu organize eder
   - Bakımı kolaylaştırır
   - Yeniden kullanılabilir

2. **Data-testid kullan**
   - CSS class ve ID'lerden bağımsız
   - Backend değişikliklerinden etkilenmeyen locator'lar

3. **Açıklayıcı test isimleri**
   ```typescript
   test('should display error when company is not selected', ...)
   ```

4. **beforeEach ve afterEach kullan**
   - Test izolasyonu
   - Temiz başlangıç durumu

5. **Assertions açık ve net**
   ```typescript
   await expect(page.locator('#error')).toContainText('Hata mesajı');
   ```

6. **Wait for API responses**
   ```typescript
   await page.waitForResponse(response => response.url().includes('/api/'));
   ```

### DON'T ❌

1. **Hard-coded wait kullanma**
   ```typescript
   // ❌ Kullanma
   await page.waitForTimeout(2000);
   ```

2. **XPath kullanma (mümkünse)**
   ```typescript
   // ❌ Karmaşık ve kırılgan
   await page.locator('//div[@class="container"]/button[1]').click();

   // ✅ Tercih et
   await page.click('[data-testid="submit-button"]');
   ```

3. **Çok fazla assertion tek test'te**
   ```typescript
   // ❌ Tek test'te çok fazla şey test etme
   test('should do everything', async ({ page }) => {
     // 50 satır assertion...
   });

   // ✅ Ayrı test'lere böl
   test('should display form', ...)
   test('should validate inputs', ...)
   test('should submit form', ...)
   ```

4. **Test'ler arası bağımlılık**
   ```typescript
   // ❌ Test'ler birbirine bağımlı olmamalı
   test('create user', ...) // Test 1
   test('login with created user', ...) // Test 2 (Test 1'e bağımlı)
   ```

5. **Magic numbers/strings**
   ```typescript
   // ❌
   await page.fill('#username', 'test@example.com');

   // ✅
   import { TEST_USERS } from './constants';
   await page.fill('#username', TEST_USERS.FINANS.username);
   ```

---

## 📞 Yardım ve Destek

### Playwright Dokümantasyonu
- **Resmi Docs**: https://playwright.dev/
- **API Reference**: https://playwright.dev/docs/api/class-playwright

### Topluluk
- **Discord**: https://aka.ms/playwright/discord
- **Stack Overflow**: [playwright] tag
- **GitHub Issues**: https://github.com/microsoft/playwright/issues

### Proje Özgü
- **Memory Bank**: `memory-bank/` dizininde proje detayları
- **Test Examples**: `tests/` dizininde mevcut örnekler
- **README**: Proje kök dizininde

---

## 🎯 Sonuç

Bu rehber, Ödeme Süreci Yönetim Sistemi için kapsamlı bir Playwright test altyapısı kurmak için gereken tüm bilgileri içermektedir.

**Önemli Noktalar:**
- ✅ **6 Aşamalı Süreç**: Her aşama detaylı test edilmelidir
- ✅ **Rol Bazlı Testler**: Her rol için ayrı test senaryoları
- ✅ **Page Object Pattern**: Kodun yeniden kullanılabilirliği
- ✅ **Backend Bağımsızlığı**: UI-first testing
- ✅ **CI/CD Ready**: Otomatik test çalıştırma

**Sonraki Adımlar:**
1. Bu dokümanı inceleyin
2. Örnek test'leri çalıştırın
3. Kendi test'lerinizi yazın
4. CI/CD pipeline'ına entegre edin
5. Coverage'ı artırın

İyi testler! 🚀
