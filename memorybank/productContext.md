# Product Context

## Neden Bu Proje Var?

### Çözülen Problemler
1. **Manuel Satınalma Süreci**: Geleneksel kağıt bazlı veya e-posta ile yürütülen satınalma talepleri zaman alıcı ve takibi zor
2. **SAP Karmaşıklığı**: SAP Business One'ın karmaşık arayüzü yerine kullanıcı dostu bir web arayüzü ihtiyacı
3. **Takip Zorluğu**: Satınalma taleplerinin hangi aşamada olduğunu görmek ve takip etmek zordu
4. **Erişim Kısıtlamaları**: SAP lisans maliyetleri nedeniyle tüm kullanıcılara SAP erişimi vermek mümkün değil
5. **Raporlama İhtiyacı**: Taleplerin toplu olarak Excel formatında raporlanması ihtiyacı

### Hedef Kullanıcı Deneyimi

#### Talep Oluşturma Süreci
1. Kullanıcı login ekranından sisteme giriş yapar
2. "Talep Oluştur" butonuna tıklar
3. Form üzerinde:
   - Talep başlık bilgilerini girer (gerekli tarih, geçerlilik tarihi, aciliyet)
   - Satırlar ekler (malzeme kodu, miktar, tedarikçi, vs.)
   - Dosya ekleyebilir
   - Açıklama ve notlar ekleyebilir
4. Talebi gönderir ve SAP'ye kaydedilir

#### Talep Takibi
1. Kullanıcı "Talep Listesi" sayfasında tüm taleplerini görür
2. Duruma göre filtreleme yapabilir
3. Detay popup'ında tüm bilgileri görebilir
4. Gerektiğinde Excel'e aktarabilir

#### Satınalmacı Süreci
1. Satınalmacı tüm talepleri görür
2. Talepleri inceleyip onaylayabilir, revize isteyebilir veya reddedebilir
3. Durum güncellemeleri yapar (Satınalma Teklifi, Satınalma Siparişi, vb.)

## Nasıl Çalışmalı?

### Temel İş Akışı

```
Kullanıcı → Talep Oluştur → SAP'ye Kaydet → Satınalmacıda
                                              ↓
                                      İnceleme ve Karar
                                              ↓
                          ┌───────────────────┼───────────────────┐
                          ↓                   ↓                   ↓
                    Onay (İlerlet)      Revize İste          Reddet
                          ↓                   ↓                   ↓
                  Satınalma Teklifi    Kullanıcıya İade    Reddedildi
                          ↓
                  Satınalma Siparişi
                          ↓
                    Mal Girişi
                          ↓
                  Satıcı Faturası
                          ↓
                  Ödeme Yapıldı
                          ↓
                    Tamamlandı
```

### Durum Yönetimi

**Talep Durumları:**
- Satınalmacıda: Yeni oluşturulan talepler
- Revize İstendi: Satınalmacı düzeltme talep etmiş
- Reddedildi: Talep kabul edilmemiş
- Satınalma Teklifi: Tedarikçilerden teklif alınıyor
- Satınalma Talebi: Satınalma onaylandı
- Satınalma Siparişi: Sipariş verildi
- Mal Girişi: Malzeme depoya girdi
- Satıcı Faturası: Fatura alındı
- Ödeme Yapıldı: Ödeme tamamlandı
- Tamamlandı: Süreç tamamlandı

### Kullanıcı Rolleri ve Yetkileri

**Admin:**
- Tüm talepleri görüntüleyebilir
- Tüm işlemleri yapabilir
- Kullanıcı yönetimi (gelecekte)
- Sistem ayarları

**Purchaser (Satınalmacı):**
- Tüm talepleri görüntüleyebilir
- Talep oluşturabilir
- Talep durumlarını güncelleyebilir
- Revize veya red işlemi yapabilir

**User (Kullanıcı):**
- Kendi taleplerini oluşturabilir
- Kendi taleplerini görüntüleyebilir
- Revize istenen talepleri düzenleyebilir

## Önemli Özellikler

### 1. Modern Login Deneyimi
- Pastel renkler ve glassmorphism efekti
- Animasyonlu carousel ile görseller
- Ken Burns efekti ile dinamik görüntüler
- Demo hesap kartları

### 2. Talep Listesi
- Sayfalama (10/20/50/100 kayıt)
- Filtreleme ve arama
- Durum bazlı renklendirme
- Excel export özelliği
- Test verisi ekleme özelliği

### 3. Talep Detay Popup
- Tüm talep bilgileri
- Satır açıklamaları
- Dosya indirme
- Aciliyet durumu kartı
- Departman bilgisi

### 4. Talep Oluşturma Formu
- Malzeme seçim dialogu
- Tedarikçi seçim dialogu
- Dosya yükleme
- Tarih inputlarına tıklayınca takvim otomatik açılma
- Satır bazında gerekli tarih güncelleme

## Kullanıcı Deneyimi İyileştirmeleri

### Son Eklenen Özellikler
1. Kalem Sayısı kolonu kaldırıldı (gereksiz)
2. Tarih inputları UX iyileştirmesi
3. Popup detay zenginleştirmesi
4. Excel export geliştirildi (21 kolon)
5. Sayfalama sistemi
6. Test verisi üzerine ekleme özelliği
7. Login sayfası modern tasarım
8. Carousel Ken Burns animasyonu

## Gelecek Vizyonu
- Mobil uygulama
- Push bildirimleri
- Gelişmiş raporlama
- Dashboard ve analytics
- E-imza entegrasyonu
- Bütçe kontrolü
- Çoklu dil desteği
