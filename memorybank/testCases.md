# Ödeme Süreci Özellikleri İçin Test Senaryoları

## 1. Özet Sayfası (`src/pages/PaymentSummary.tsx`)

### 1.1. Değişiklikleri Kaydet Butonu
- **Test 1.1.1:** Bir cari için "Toplam Ödeme" tutarını değiştirin ve "Değişiklikleri Kaydet" butonuna tıklayın.
  - **Beklenen Sonuç:** Başarılı olduğuna dair bir bildirim görünmelidir. Sayfa yenilendiğinde yeni tutar kalıcı olmalıdır.
- **Test 1.1.2:** Hiçbir değişiklik yapmadan kaydetmeyi deneyin.
  - **Beklenen Sonuç:** Kaydetme işlemi yine de başarılı olmalı ve veride bir değişiklik olmamalıdır.

### 1.2. Cari Silme Butonu
- **Test 1.2.1:** Bir cari satırındaki silme ikonuna tıklayın.
  - **Beklenen Sonuç:** Cari adını içeren bir onay penceresi açılmalıdır.
- **Test 1.2.2:** Onay penceresinde "İptal" butonuna tıklayın.
  - **Beklenen Sonuç:** Pencere kapanmalı ve cari silinmemelidir.
- **Test 1.2.3:** Onay penceresinde "Sil" butonuna tıklayın.
  - **Beklenen Sonuç:** Başarılı olduğuna dair bir bildirim görünmelidir. Cari satırı özet tablosundan kaldırılmalıdır. O cariye ait tüm faturalar silinmiş olarak işaretlenmelidir.

### 1.3. Excel'e Aktar Butonu
- **Test 1.3.1:** "Excel'e Aktar" butonuna tıklayın.
  - **Beklenen Sonuç:** `Odeme_Ozeti_[SüreçNo]_[Tarih].xlsx` adında bir Excel dosyası indirilmelidir.
- **Test 1.3.2:** İndirilen Excel dosyasını açın.
  - **Beklenen Sonuç:** Dosya, özet tablosuyla aynı verileri, doğru sütunları ve formatlamayı içermelidir. Filtrelenmiş veriler dışa aktarıma yansıtılmalıdır.

### 1.4. Cari Fatura Detayları Dialog Penceresi
- **Test 1.4.1:** Bir cari satırındaki "Detay" butonuna tıklayın.
  - **Beklenen Sonuç:** Sadece o cariye ait faturaları gösteren büyük bir pencere açılmalıdır.
- **Test 1.4.2:** Pencerede, bir fatura için "Ödenecek Tutar"ı değiştirin ve "Değişiklikleri Kaydet" butonuna tıklayın.
  - **Beklenen Sonuç:** Pencere kapanmalıdır. Ana özet tablosundaki cari için "Toplam Ödeme" tutarı, değişikliği yansıtacak şekilde güncellenmelidir.
- **Test 1.4.3:** Pencerede, bir fatura seçin ve "Seçilenleri Sil" butonuna tıklayın. Ardından "Değişiklikleri Kaydet"e tıklayın.
  - **Beklenen Sonuç:** Pencere kapanmalıdır. Cari için "Toplam Ödeme" ve "Toplam Fatura" tutarları güncellenmelidir. Detay penceresini yeniden açtığınızda faturanın kaldırıldığı görülmelidir.
- **Test 1.4.4:** Pencereyi açın ve değişiklik yapmadan "İptal"e tıklayın.
  - **Beklenen Sonuç:** Pencere, herhangi bir değişiklik yapılmadan kapanmalıdır.

## 2. Genel İşlevsellik

- **Test 2.1:** Tüm butonların, kullanıcının rolüne ve mevcut süreç aşamasına (`isStageEditable`) göre devre dışı bırakıldığından veya gizlendiğinden emin olun.
- **Test 2.2:** Tüm yeni özelliklerin duyarlı (responsive) olduğunu ve farklı ekran boyutlarında doğru çalıştığını doğrulayın.
