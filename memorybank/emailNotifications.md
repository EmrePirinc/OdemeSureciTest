# E-Posta Bildirim Sistemi Dokümantasyonu

**Proje:** Ödeme Süreci (Payment Process)


---

---

## 🎯 Genel Bakış

Ödeme süreci, 6 aşamadan oluşan bir workflow sistemidir. Her aşama geçişinde ilgili kullanıcılara e-posta bildirimi gönderilmelidir.

### Temel Prensipler

1. **Her aşama geçişinde mail gönderilir** (1→2, 2→3, 3→4, 4→5, 5→6)
2. **Geri atama durumunda da mail gönderilir** (5→4, 4→3, vb.)
3. **6. aşama onayından sonra Excel talimat dosyası eklenir**
4. **Diğer aşamalarda ek dosya yoktur**

---

## 📨 Mail Senaryoları

### Senaryo Matrisi

| # | Aşama Geçişi | Trigger Event | Alıcılar | Ek Dosya |
|---|-------------|---------------|----------|----------|
| 1 | **Aşama 1 → 2** | "Onaya Gönder" butonu | İç/Dış Piyasa Müdürleri | ❌ Yok |
| 2 | **Aşama 2 → 3** | Her iki müdür onayladıktan sonra | Finans Çalışanı | ❌ Yok |
| 3 | **Aşama 3 → 4** | "Onaya Gönder" butonu (ekstre yükleme sonrası) | Finans Müdürü | ❌ Yok |
| 4 | **Aşama 4 → 5** | "Onaya Gönder" butonu | Genel Müdür | ❌ Yok |
| 5 | **Aşama 5 → 6** | "Onayla" butonu (final onay) | Finans Çalışanı | ❌ Yok |
| 6 | **Aşama 6 Tamamlandı (Süreç Tamamlandı)** | "Talimat Oluştur" butonu | TO: Finans Müdürü, CC: Finans Çalışanı | ✅ **Excel Talimat Dosyası** (Template 2) |
| 7 | **Geri Atama (5 → 4)** | "Geri Ata" butonu | Finans Müdürü | ❌ Yok |
| 8 | **Geri Atama (4 → 3)** | "Geri Ata" butonu | Finans Çalışanı | ❌ Yok |

---

## 👥 Gönderen ve Alıcı Kuralları

### Roller ve E-posta Adresleri

**⚠️ ÖNEMLİ:** E-posta adresleri **veritabanından dinamik olarak alınır**.

| Rol | Kullanıcı Sayısı | Email Kaynağı | Açıklama |
|-----|-----------------|---------------|----------|
| **Finans Çalışanı** | 1+ | `Users.Email` | Süreci başlatan ve sonlandıran rol |
| **İç Piyasa Müdürü** | 1 | `Users.Email` | İç piyasa faturalarını onaylayan |
| **Dış Piyasa Müdürü** | 1 | `Users.Email` | Dış piyasa faturalarını onaylayan |
| **Finans Müdürü** | 1 | `Users.Email` | Finans departmanı yöneticisi |
| **Genel Müdür** | 1 | `Users.Email` | Nihai onay merci |

**Email Sorgusu:**
```sql
SELECT Email
FROM [AnadoluBakirWebDb].[dbo].[Users]
WHERE Role = 'FinansCalisani' -- veya ilgili rol
  AND Email IS NOT NULL
  AND Email != '';
```

**Not:** Admin sayfasından eklenen kullanıcıların email adresleri `Users` tablosunda tutulur ve mail gönderiminde buradan çekilir.

### Gönderen (From) Kuralları

**Tüm maillerde gönderen:**
- **From (Gönderen):** `AB Portal (Ödeme Süreci) <abportal@anadolubakir.com>`
- **Display Name:** AB Portal (Ödeme Süreci)

**Örnek:**
```javascript
From: AB Portal (Ödeme Süreci) <abportal@anadolubakir.com>
To: mehmet.yilmaz@anadolubakir.com
Subject: 🔔 Ödeme Süreci Onayı Bekleniyor - PAY-2025-001
```

**Mail Footer'da Bilgilendirme:**
```
Bu mail otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
Sorularınız için: abportal@anadolubakir.com
```

### Alıcı (To) ve CC Kuralları

#### 1️⃣ Aşama 1 → 2 (Onaya Gönder)

**To (Alıcılar):**
- İç Piyasa Müdürü (eğer süreçte iç piyasa faturaları varsa)
- Dış Piyasa Müdürü (eğer süreçte dış piyasa faturaları varsa)


**Kural:**
- Eğer sadece iç piyasa faturaları varsa → Sadece İç Piyasa Müdürüne
- Eğer sadece dış piyasa faturaları varsa → Sadece Dış Piyasa Müdürüne
- Her ikisi de varsa → Her iki müdüre

---

#### 2️⃣ Aşama 2 → 3 (Müdür Onayları Tamamlandı)

**To (Alıcılar):**
- Finans Çalışanı (süreci başlatan kişi)


---

#### 3️⃣ Aşama 3 → 4 (Ekstre Yükleme Sonrası)

**To (Alıcılar):**
- Finans Müdürü

---

#### 4️⃣ Aşama 4 → 5 (Finans Müdürü Onayı)

**To (Alıcılar):**
- Genel Müdür

---

#### 5️⃣ Aşama 5 → 6 (Genel Müdür Nihai Onayı)

**To (Alıcılar):**
- Finans Çalışanı (talimat oluşturacak kişi)

---

#### 6️⃣ Aşama 6 Tamamlandı (Talimat Oluşturuldu) ⭐ **EK DOSYA VAR**

**To (Alıcılar):**
- Finans Müdürü

**CC (Bilgi):**
- Finans Çalışanı

**Ek Dosya:**
- **Dosya Adı:** `Odeme_Talimati_[OdemeSiraNo]_[GG.AA.YYYY].xlsx`
- **Örnek:** `Odeme_Talimati_OS_2_11.11.2025.xlsx`
- **İçerik:** Excel çekme listesi (talimat dosyası)
- **Format:** .xlsx

---

#### 7️⃣ Geri Atama (Aşama 5 → 4)

**To (Alıcılar):**
- Finans Müdürü (geri atanan kişi)

---

#### 8️⃣ Geri Atama (Aşama 4 → 3)

**To (Alıcılar):**
- Finans Çalışanı (geri atanan kişi)

---

## 🎨 Mail Template Tasarımları

### Template 1: Standart Bildirim (Aşama Geçişi)

**Kullanım:** Aşama 1→2, 2→3, 3→4, 4→5, 5→6



**Template Dosyası:** [standardNotificationTemplate.html](./email-templates/standardNotificationTemplate.html)

---

### Template 2: Süreç Tamamlandı + Excel Eki (Aşama 6 Tamamlandı)

**Kullanım:** Aşama 6 tamamlandığında (Finans Çalışanı "Talimat Oluştur" butonuna bastığında)

**Alıcılar:**
- **TO:** Finans Müdürü (Excel dosyasını kullanacak kişi)
- **CC:** Finans Çalışanı (bilgilendirme)

**Ek Dosya:** ✅ Excel talimat dosyası (`Odeme_Talimati_OS_X_DD.MM.YYYY.xlsx`)

**Özellikler:**
- 🎉 Kutlama tonu (süreç tamamlandı)
- 📊 Excel dosya bilgisi kartı
- 📋 Detaylı süreç özeti
- ✅ Timeline (6 aşamanın tümü + onaylayanlar)
- 📧 Finans Müdürü ve Finans Çalışanı'na bilgilendirme



**Template Dosyası:** [processCompletedTemplate.html](./email-templates/processCompletedTemplate.html)

---

### Template 3: Geri Atama (Rejection)

**Kullanım:** Geri atama durumlarında (5→4, 4→3)



**Template Dosyası:** [rejectionTemplate.html](./email-templates/rejectionTemplate.html)

---

## 📝 Mail İçerikleri (Her Aşama)

### Aşama 1 → 2: Müdür Onayına Gönderildi

**Konu (Subject):**
```
🔔 Ödeme Süreci Onayı Bekleniyor - {{SUREC_NO}}
```

**Template Değişkenleri:**
```javascript
{
  ALICI_ADI: "MESUT ERDOĞDU",                           // Stage2_IcPiyasaMuduru_ApprovedBy (from Users table)
  GONDERICI_ADI: "Emre Pirinc",                         // CreatedBy
  SUREC_NO: "ÖS-1",                                     // "ÖS-" + Numarator
  BASLATAN_ADI: "Emre Pirinc",                          // CreatedBy
  TITLE: "Ödeme Süreci - Yönetici Onayı Bekliyor (Aşama 2)", // paymentTasks.Title (olduğu gibi)
  VADE_BASLANGIC: "01.01.2025",                         // DueDateStart (formatted DD.MM.YYYY)
  VADE_BITIS: "12.12.2025",                             // DueDateEnd (formatted DD.MM.YYYY)
  SUREC_NOTU: "Acil ödeme gerekiyor - Vade 15.11.2025",
  SUREC_LINKI: "http://167.16.21.50:81/payment/tasks"
}
```

**Mail Metni (Template 1 kullanılır)**

---

### Aşama 2 → 3: Müdür Onayları Tamamlandı

**Konu (Subject):**
```
✅ Müdür Onayları Tamamlandı - Ekstre Yükleme Gerekli - {{SUREC_NO}}
```

**Template Değişkenleri:**
```javascript
{
  ALICI_ADI: "Emre Pirinc",                             // CreatedBy (süreç başlatanın kendisine geri dönüyor)
  GONDERICI_ADI: "ONUR KARAKAYA",                       // Stage3_ApprovedBy (Dış Piyasa Müdürü, from Users table)
  SUREC_NO: "ÖS-1",                                     // "ÖS-" + Numarator
  BASLATAN_ADI: "Emre Pirinc",                          // CreatedBy
  TITLE: "Ödeme Süreci - Ekstre Yükleme (Aşama 3)",    // paymentTasks.Title (olduğu gibi)
  VADE_BASLANGIC: "01.01.2025",                         // DueDateStart (formatted DD.MM.YYYY)
  VADE_BITIS: "12.12.2025",                             // DueDateEnd (formatted DD.MM.YYYY)
  SUREC_NOTU: "İç ve Dış Piyasa Müdürleri onayladı. Lütfen her cari için ekstre yükleyin.",
  SUREC_LINKI: "http://167.16.21.50:81/payment/tasks"
}
```

**Mail Metni (Template 1 kullanılır)**

**Ek Bilgi (content içinde eklenebilir):**
```html
<div class="alert-box">
    <p><strong>⚠️ Önemli:</strong> Her cari için zorunlu olarak ekstre yüklemeniz gerekmektedir.
    Tüm ekstreler yüklenmedikçe bir sonraki aşamaya geçemezsiniz.</p>
</div>
```

---

### Aşama 3 → 4: Finans Müdürü Onayına Gönderildi

**Konu (Subject):**
```
🔔 Finans Müdürü Onayı Bekleniyor - {{SUREC_NO}}
```

**Template Değişkenleri:**
```javascript
{
  ALICI_ADI: "HAKKI YETİŞ",                             // Stage4_ApprovedBy (Finans Müdürü, from Users table)
  GONDERICI_ADI: "Emre Pirinc",                         // CreatedBy (ekstre yükleyen)
  SUREC_NO: "ÖS-1",                                     // "ÖS-" + Numarator
  BASLATAN_ADI: "Emre Pirinc",                          // CreatedBy
  TITLE: "Ödeme Süreci - Finans Müdürü Onayı (Aşama 4)", // paymentTasks.Title (olduğu gibi)
  VADE_BASLANGIC: "01.01.2025",                         // DueDateStart (formatted DD.MM.YYYY)
  VADE_BITIS: "12.12.2025",                             // DueDateEnd (formatted DD.MM.YYYY)
  SUREC_NOTU: "Tüm ekstreler yüklendi. İncelemeniz ve onayınız bekleniyor.",
  SUREC_LINKI: "http://167.16.21.50:81/payment/tasks"
}
```

**Mail Metni (Template 1 kullanılır)**

---

### Aşama 4 → 5: Genel Müdür Nihai Onayına Gönderildi

**Konu (Subject):**
```
🔔 Genel Müdür Nihai Onayı Bekleniyor - {{SUREC_NO}}
```

**Template Değişkenleri:**
```javascript
{
  ALICI_ADI: "COŞKUN PİRİNÇ",                           // Stage5_ApprovedBy (Genel Müdür, from Users table)
  GONDERICI_ADI: "HAKKI YETİŞ",                         // Stage4_ApprovedBy (Finans Müdürü)
  SUREC_NO: "ÖS-1",                                     // "ÖS-" + Numarator
  BASLATAN_ADI: "Emre Pirinc",                          // CreatedBy
  TITLE: "Ödeme Süreci - Genel Müdür Onayı (Aşama 5)", // paymentTasks.Title (olduğu gibi)
  VADE_BASLANGIC: "01.01.2025",                         // DueDateStart (formatted DD.MM.YYYY)
  VADE_BITIS: "12.12.2025",                             // DueDateEnd (formatted DD.MM.YYYY)
  SUREC_NOTU: "Finans Müdürü inceledi ve onayladı. Nihai onayınız bekleniyor.",
  SUREC_LINKI: "http://167.16.21.50:81/payment/tasks"
}
```

**Mail Metni (Template 1 kullanılır)**

**Ek Bilgi (content içinde eklenebilir):**
```html
<div class="alert-box" style="background-color: #fff3cd; border-left-color: #ffc107;">
    <p><strong>⚠️ Dikkat:</strong> Bu aşamadan sonra süreç talimat oluşturma aşamasına geçecektir.
    Onayınız ile birlikte Excel talimat dosyası finans kullanıcısına gönderilecektir.</p>
</div>
```

---

### Aşama 5 → 6: Genel Müdür Onayladı - Talimat Oluşturma Aşamasına Geldi

**Konu (Subject):**
```
✅ Ödeme Onaylandı - Talimat Oluşturabilirsiniz - {{SUREC_NO}}
```

**Template Değişkenleri:**
```javascript
{
  ALICI_ADI: "Emre Pirinc",                             // CreatedBy (süreç başlatan, talimat oluşturacak kişi)
  GONDERICI_ADI: "COŞKUN PİRİNÇ",                       // Stage5_ApprovedBy (Genel Müdür)
  SUREC_NO: "ÖS-1",                                     // "ÖS-" + Numarator
  BASLATAN_ADI: "Emre Pirinc",                          // CreatedBy
  TITLE: "Ödeme Süreci - Ödeme Talimatı Oluşturma (Aşama 6)", // paymentTasks.Title (olduğu gibi)
  VADE_BASLANGIC: "01.01.2025",                         // DueDateStart (formatted DD.MM.YYYY)
  VADE_BITIS: "12.12.2025",                             // DueDateEnd (formatted DD.MM.YYYY)
  SUREC_NOTU: "Tüm onaylar tamamlandı - Talimat oluşturabilirsiniz",
  SUREC_LINKI: "http://167.16.21.50:81/payment/tasks"
}
```

**Mail Metni (Template 1 kullanılır)**

---

### Aşama 6 Tamamlandı: Süreç Tamamlandı + Talimat Oluşturuldu ⭐

**Konu (Subject):**
```
🎉 Ödeme Süreci Tamamlandı - Excel Talimat Ekte - {{SUREC_NO}}
```

**Template Değişkenleri:**
```javascript
{
  ALICI_ADI: "HAKKI YETİŞ",                             // Stage4_ApprovedBy (Finans Müdürü, TO: alıcı)
  SUREC_NO: "ÖS-1",                                     // "ÖS-" + Numarator
  BASLATAN_ADI: "Emre Pirinc",                          // CreatedBy (from Users table)
  BASLANGIC_TARIHI: "11.11.2025 11:46",                 // ProcessStartDate (formatted DD.MM.YYYY HH:mm)
  TAMAMLANMA_TARIHI: "11.11.2025 17:15",                // CompletedDate (formatted DD.MM.YYYY HH:mm)
  TALIMAT_OLUSTURAN: "Emre Pirinc",                     // Stage6_CompletedBy (from Users table)
  TALIMAT_TARIHI: "11.11.2025 17:15",                   // CompletedDate (formatted DD.MM.YYYY HH:mm)
  ODEME_TARIHI: "15.11.2025",                           // PaymentDate (formatted DD.MM.YYYY)
  VADE_BASLANGIC: "01.01.2025",                         // DueDateStart (formatted DD.MM.YYYY)
  VADE_BITIS: "12.12.2025",                             // DueDateEnd (formatted DD.MM.YYYY)
  EXCEL_DOSYA_ADI: "Odeme_Talimati_OS_1_11.11.2025.xlsx", // Filename format
  DOSYA_BOYUTU: "127 KB",                               // File size from attachment
  // Timeline variables - 6 aşamanın tümü
  ASAMA1_ONAYLAYAN: "Emre Pirinc",                      // CreatedBy
  ASAMA1_TARIH: "11.11.2025 11:46",                     // ProcessStartDate
  ASAMA2_ONAYLAYAN: "MESUT ERDOĞDU, ONUR KARAKAYA",     // Stage2_IcPiyasaMuduru_ApprovedBy & Stage2_DisPiyasaMuduru_ApprovedBy
  ASAMA2_TARIH: "11.11.2025 12:30",                     // Stage2_ApprovedDate
  ASAMA3_ONAYLAYAN: "Emre Pirinc",                      // CreatedBy (ekstre yükleyen)
  ASAMA3_TARIH: "11.11.2025 14:15",                     // Stage3_CompletedDate (ekstre yükleme)
  ASAMA4_ONAYLAYAN: "HAKKI YETİŞ",                      // Stage4_ApprovedBy (Finans Müdürü)
  ASAMA4_TARIH: "11.11.2025 15:20",                     // Stage4_ApprovedDate
  ASAMA5_ONAYLAYAN: "COŞKUN PİRİNÇ",                    // Stage5_ApprovedBy (Genel Müdür)
  ASAMA5_TARIH: "11.11.2025 16:45",                     // Stage5_ApprovedDate
  ASAMA6_ONAYLAYAN: "Emre Pirinc",                      // Stage6_CompletedBy (Talimat oluşturan)
  ASAMA6_TARIH: "11.11.2025 17:15",                     // CompletedDate
  TAMAMLANAN_SUREC_LINKI: "http://167.16.21.50:81/payment/tasks" // Sabit link
}
```

**Mail Metni (Template 2 kullanılır)**

**Özel Özellikler:**
- 🎉 Kutlama tonu (süreç tamamlandı)
- ✅ Tam Timeline (6 aşamanın tümü + onaylayanlar + tarihler)
- 📋 Detaylı süreç özeti
- 📄 Excel dosya kartı ve indirme bilgisi
- 📧 TO: Finans Müdürü, CC: Finans Çalışanı

**Ek Dosya:**
- `Odeme_Talimati_OS_1_11.11.2025.xlsx` (Excel talimat dosyası)

---

### Geri Atama: Aşama 5 → 4

**Konu (Subject):**
```
↩️ Süreç Geri Atandı - Revizyon Gerekli - {{SUREC_NO}}
```

**Template Değişkenleri:**
```javascript
{
  ALICI_ADI: "HAKKI YETİŞ",                             // Stage4_ApprovedBy (Finans Müdürü, geri atanan kişi)
  GERI_ATAYAN_ADI: "COŞKUN PİRİNÇ",                     // Stage5_ApprovedBy (Genel Müdür, geri atayan)
  GERI_ATAYAN_ROL: "Genel Müdür",                       // Role from Users table
  SUREC_NO: "ÖS-1",                                     // "ÖS-" + Numarator
  GERI_ATAMA_TARIHI: "11.11.2025 16:50",                // RejectionDate (formatted DD.MM.YYYY HH:mm)
  ONCEKI_ASAMA: "5",                                    // Previous CurrentStage
  HEDEF_ASAMA: "4",                                     // New CurrentStage after rejection
  HEDEF_ASAMA_ADI: "Finans Müdürü İnceleme",
  VADE_BASLANGIC: "01.01.2025",                         // DueDateStart (formatted DD.MM.YYYY)
  VADE_BITIS: "12.12.2025",                             // DueDateEnd (formatted DD.MM.YYYY)
  GERI_ATAMA_NEDENI: "X firmasının ödeme tutarı yanlış hesaplanmış. Lütfen kontrol edip düzeltiniz. Ayrıca Y firmasının ekstresinde tarih uyumsuzluğu var.", // RejectionReason
  SUREC_LINKI: "http://167.16.21.50:81/payment/tasks"
}
```

**Mail Metni (Template 3 kullanılır)**

---

### Geri Atama: Aşama 4 → 3

**Konu (Subject):**
```
↩️ Süreç Geri Atandı - Düzeltme Gerekli - {{SUREC_NO}}
```

**Template Değişkenleri:**
```javascript
{
  ALICI_ADI: "Emre Pirinc",                             // CreatedBy (süreç başlatan, ekstre yükleyen)
  GERI_ATAYAN_ADI: "HAKKI YETİŞ",                       // Stage4_ApprovedBy (Finans Müdürü, geri atayan)
  GERI_ATAYAN_ROL: "Finans Müdürü",                     // Role from Users table
  SUREC_NO: "ÖS-1",                                     // "ÖS-" + Numarator
  GERI_ATAMA_TARIHI: "11.11.2025 15:50",                // RejectionDate (formatted DD.MM.YYYY HH:mm)
  ONCEKI_ASAMA: "4",                                    // Previous CurrentStage
  HEDEF_ASAMA: "3",                                     // New CurrentStage after rejection
  HEDEF_ASAMA_ADI: "Konsolidasyon ve Ekstre Yükleme",
  VADE_BASLANGIC: "01.01.2025",                         // DueDateStart (formatted DD.MM.YYYY)
  VADE_BITIS: "12.12.2025",                             // DueDateEnd (formatted DD.MM.YYYY)
  GERI_ATAMA_NEDENI: "ABC Tedarik firmasının ekstresi eksik. Lütfen güncel ekstre yükleyin.", // RejectionReason
  SUREC_LINKI: "http://167.16.21.50:81/payment/tasks"
}
```

**Mail Metni (Template 3 kullanılır)**

---

## ⚙️ Teknik Gereksinimler

### 1. SMTP Konfigürasyonu (Office 365)

```javascript
{
  host: "smtp.office365.com",
  port: 587,
  secure: false,  // STARTTLS kullanılır
  auth: {
    user: "abportal@anadolubakir.com",
    pass: process.env.SMTP_PASSWORD  // Environment variable'dan okunmalı
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  }
}
```

**Office 365 Limitleri:**
- **Günlük Alıcı Limiti:** 10.000 alıcı/gün
- **Gönderim Hızı:** ~30 mail/dakika (SMTP)
- **Mail Başına Maksimum Alıcı:** 500 kişi

---

### 2. Backend API Endpoint Önerileri

#### 2.1 Mail Gönderme API

```typescript
POST /api/payment/send-notification-email

Request Body:
{
  processId: string;              // "PAY-2025-001"
  eventType: string;              // "stage_transition" | "rejection" | "completion"
  fromStage: number;              // 1-6
  toStage: number;                // 1-6
  triggeredByUserId: string;      // User ID
  rejectionReason?: string;       // Geri atama nedeni (opsiyonel)
}

Response:
{
  success: boolean;
  message: string;
  emailsSent: number;
  recipients: string[];
}
```

#### 2.2 Excel Talimat Oluşturma API

```typescript
POST /api/payment/generate-instruction-excel

Request Body:
{
  processId: string;              // "PAY-2025-001"
}

Response:
{
  success: boolean;
  fileName: string;               // "Odeme_Talimati_OS_2_11.11.2025.xlsx"
  fileSize: number;               // Bytes
  base64Data: string;             // Base64 encoded Excel dosyası
}
```

#### 2.3 Kullanıcı Email Sorgulama API

```typescript
GET /api/users/emails-by-role?role={roleName}

Query Params:
- role: "FinansCalisani" | "IcPiyasaMuduru" | "DisPiyasaMuduru" | "FinansMuduru" | "GenelMudur"

Response:
{
  success: boolean;
  role: string;
  users: [
    {
      userId: string;
      email: string;
      nameLastName: string;
    }
  ],
  count: number;
}
```

---

### 3. Veritabanı Sorguları

#### Email Adresi Sorgulama

```sql
-- Belirli bir role sahip kullanıcıların emaillerini çek
SELECT UserID, Email, NameLastName, Role
FROM [AnadoluBakirWebDb].[dbo].[Users]
WHERE Role = @Role
  AND Email IS NOT NULL
  AND Email != ''
  AND IsActive = 1;

-- Örnek Kullanımlar:
-- Finans Çalışanları: WHERE Role = 'FinansCalisani'
-- İç Piyasa Müdürü: WHERE Role = 'IcPiyasaMuduru'
-- Dış Piyasa Müdürü: WHERE Role = 'DisPiyasaMuduru'
-- Finans Müdürü: WHERE Role = 'FinansMuduru'
-- Genel Müdür: WHERE Role = 'GenelMudur'
```

---

### 4. Environment Variables (.env)

```bash
# EMAIL CONFIGURATION (Office 365)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=abportal@anadolubakir.com
SMTP_PASSWORD=your_password_here
SMTP_FROM_NAME=AB Portal (Ödeme Süreci)
SMTP_FROM_EMAIL=abportal@anadolubakir.com

# DATABASE CONNECTION
DB_HOST=your_server
DB_PORT=1433
DB_NAME=AnadoluBakirWebDb
DB_USER=your_user
DB_PASSWORD=your_password

# APPLICATION
APP_URL=http://167.16.21.50:81
```

**⚠️ Güvenlik Notu:**
- `.env` dosyası `.gitignore`'a eklenmelidir
- SMTP şifresi asla kodda hardcode edilmemeli

---

### 5. Önerilen Kütüphaneler

```json
{
  "dependencies": {
    "nodemailer": "^6.9.0",          // Email gönderimi
    "exceljs": "^4.4.0",             // Excel dosya oluşturma
    "mssql": "^10.0.0"               // SQL Server bağlantısı
  }
}
```

---


