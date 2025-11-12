# E-flow Test Senaryoları

## Site Bilgileri
- **URL:** http://167.16.21.50:81/
- **Uygulama:** Satınalma Talep Sistemi
- **Şirket:** Anadolu Bakır

---

## Login Testleri (20 Test Case)

### Temel Fonksiyonellik Testleri

| Test ID | Test Adı | Açıklama | Beklenen Sonuç |
|---------|----------|----------|----------------|
| TC-001 | Login sayfasının yüklenmesi | Sayfa başlığı ve temel elemanların kontrolü | Sayfa başarıyla yüklenmeli |
| TC-002 | Login form elemanlarının varlığı | Tüm form elemanlarının görünür olduğunu kontrol et | Şirket dropdown, kullanıcı adı, şifre ve giriş butonu görünür olmalı |
| TC-003 | Şirket dropdown seçenekleri | 8 şirket seçeneğinin kontrolü | Tüm seçenekler listelenebilmeli |
| TC-004 | Boş form ile giriş denemesi | Hiçbir alan doldurulmadan giriş | Hata mesajı gösterilmeli veya giriş yapılmamalı |
| TC-005 | Sadece kullanıcı adı ile giriş | Şifre girilmeden giriş denemesi | Giriş başarısız olmalı |
| TC-006 | Sadece şifre ile giriş | Kullanıcı adı girilmeden giriş denemesi | Giriş başarısız olmalı |
| TC-007 | Geçersiz kullanıcı adı ve şifre | Yanlış bilgilerle giriş denemesi | Hata mesajı gösterilmeli |
| TC-008 | Şifre göster/gizle butonu | Toggle butonunun çalışması | Şifre görünür/gizli hale gelebilmeli |
| TC-009 | Input alanlarına yazma ve temizleme | Clear fonksiyonunun testi | Alanlar temizlenebilmeli |
| TC-010 | Placeholder metinlerinin doğruluğu | Placeholder kontrolü | Doğru metinler görünmeli |

### İleri Seviye Testler

| Test ID | Test Adı | Açıklama | Beklenen Sonuç |
|---------|----------|----------|----------------|
| TC-011 | Tüm alanları doldurarak giriş | Tam form ile giriş denemesi | Başarılı/başarısız giriş |
| TC-012 | Keyboard navigasyonu | Tab tuşu ile navigasyon | Elementler arası geçiş çalışmalı |
| TC-013 | Enter tuşu ile form gönderme | Enter ile giriş | Form gönderilebilmeli |
| TC-014 | Uzun kullanıcı adı ve şifre | 100 karakterlik input testi | Karakter limiti kontrolü |
| TC-015 | Özel karakterler ile giriş | Özel karakter desteği | Özel karakterler kabul edilmeli |

### Güvenlik Testleri

| Test ID | Test Adı | Açıklama | Beklenen Sonuç |
|---------|----------|----------|----------------|
| TC-016 | SQL Injection denemesi | Güvenlik açığı testi | Injection engellenmiş olmalı |
| TC-017 | XSS denemesi | Cross-site scripting testi | XSS engellenmiş olmalı |

### Responsive Testler

| Test ID | Test Adı | Açıklama | Beklenen Sonuç |
|---------|----------|----------|----------------|
| TC-018 | Mobil görünüm (375x667) | Mobil cihazlarda görünüm | Tüm elementler erişilebilir olmalı |
| TC-019 | Tablet görünüm (768x1024) | Tablet cihazlarda görünüm | Tüm elementler erişilebilir olmalı |

### Performans Testleri

| Test ID | Test Adı | Açıklama | Beklenen Sonuç |
|---------|----------|----------|----------------|
| TC-020 | Sayfa yüklenme süresi | Performans testi | 5 saniyeden kısa sürede yüklenmeli |

---

## Authenticated Kullanıcı Testleri (15 Test Case)

### Temel Fonksiyonellik

| Test ID | Test Adı | Açıklama | Beklenen Sonuç |
|---------|----------|----------|----------------|
| TC-AUTH-001 | Dashboard yüklenmesi | Login sonrası yönlendirme | Dashboard sayfası yüklenmeli |
| TC-AUTH-002 | Navigasyon menüsü | Menü elemanlarının kontrolü | Menü görünür ve kullanılabilir olmalı |
| TC-AUTH-003 | Kullanıcı profil bilgileri | Profil gösterimi | Kullanıcı bilgileri görünmeli |
| TC-AUTH-004 | Logout fonksiyonu | Çıkış işlemi | Login sayfasına yönlendirmeli |
| TC-AUTH-005 | Ana sayfa içerik kontrolü | İçerik elemanlarının kontrolü | Tüm beklenen elemanlar mevcut olmalı |

### Satınalma Talep Fonksiyonları

| Test ID | Test Adı | Açıklama | Beklenen Sonuç |
|---------|----------|----------|----------------|
| TC-AUTH-006 | Talep oluşturma sayfası | Yeni talep oluşturma | Talep formu açılmalı |
| TC-AUTH-007 | Arama fonksiyonu | Talep arama | Arama sonuçları listelenmeli |
| TC-AUTH-008 | Tablo sıralama | Sıralama fonksiyonu | Veriler sıralanabilmeli |
| TC-AUTH-009 | Filtreleme | Veri filtreleme | Filtreler uygulanabilmeli |
| TC-AUTH-010 | Pagination | Sayfalama kontrolü | Sayfalar arası geçiş çalışmalı |

### Ek Fonksiyonlar

| Test ID | Test Adı | Açıklama | Beklenen Sonuç |
|---------|----------|----------|----------------|
| TC-AUTH-011 | Bildirimler | Notification sistemi | Bildirimler görüntülenebilmeli |
| TC-AUTH-012 | Ayarlar sayfası | Ayarlara erişim | Ayarlar sayfası açılmalı |
| TC-AUTH-013 | Dashboard widget'ları | Widget kontrolü | Widget'lar görünür olmalı |
| TC-AUTH-014 | Excel export | Veri dışa aktarma | Excel dosyası indirilebilmeli |
| TC-AUTH-015 | Breadcrumb navigation | Sayfa konumu gösterimi | Breadcrumb çalışmalı |

---

## Test Çalıştırma Komutları

### Tüm testleri çalıştırma
```bash
npm test
```

### Sadece Login testleri
```bash
npx playwright test login.spec.ts
```

### Sadece Authenticated testleri
```bash
npx playwright test authenticated.spec.ts
```

### UI modunda test çalıştırma
```bash
npm run test:ui
```

### Belirli bir test case çalıştırma
```bash
npx playwright test --grep "TC-001"
```

### Debug modu
```bash
npm run test:debug
```

---

## Önemli Notlar

1. **Test Kullanıcısı Gerekli**: `authenticated.spec.ts` dosyasındaki testleri çalıştırmak için geçerli kullanıcı bilgileri gereklidir.

2. **Credentials Güncelleme**: `tests/authenticated.spec.ts` dosyasındaki `TEST_CREDENTIALS` nesnesini gerçek bilgilerle güncelleyin:
   ```typescript
   const TEST_CREDENTIALS = {
     company: 'Anadolu Bakır',
     username: 'gerçek_kullanıcı_adı',
     password: 'gerçek_şifre',
   };
   ```

3. **Screenshot'lar**: Tüm test screenshot'ları `screenshots/` klasörüne kaydedilir.

4. **HTML Rapor**: Test sonuçları için HTML rapor oluşturulur:
   ```bash
   npm run report
   ```

5. **Selector Güncellemeleri**: Site yapısı değişirse, test dosyalarındaki selector'ları güncellemeniz gerekebilir.

---

## Test Coverage

- **Login Testleri**: %100 (20/20 test case)
- **Authenticated Testleri**: Kullanıcı bilgilerine bağlı (15/15 test case)
- **Güvenlik Testleri**: SQL Injection, XSS
- **Responsive Testleri**: Mobil, Tablet, Desktop
- **Performans Testleri**: Sayfa yüklenme süresi

---

## Sonraki Adımlar

1. Gerçek kullanıcı bilgileri ile authenticated testleri çalıştırın
2. Site yapısına göre ek test senaryoları ekleyin
3. CI/CD pipeline'a entegre edin
4. Regression test suite'i oluşturun
5. API testleri ekleyin (gerekirse)
