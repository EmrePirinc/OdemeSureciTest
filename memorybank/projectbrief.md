# Project Brief

## Proje Adı
Satınalma Talebi Yönetim Sistemi (SatinalmaTalebiWeb)

## Proje Özeti
SAP Business One ile entegre çalışan, satınalma taleplerini (Purchase Request - PRQ) yönetmek için geliştirilmiş bir web uygulaması. Kullanıcılar bu sistem üzerinden satınalma talepleri oluşturabilir, mevcut talepleri görüntüleyebilir, düzenleyebilir ve takip edebilir.

## Temel Amaç
- SAP Business One satınalma süreçlerini modern bir web arayüzü ile yönetmek
- Kullanıcıların kolayca satınalma talebi oluşturmasını sağlamak
- Taleplerin durumunu ve sürecini takip etmek
- Rol bazlı yetkilendirme ile farklı kullanıcı seviyelerine uygun erişim sağlamak

## Kapsam

### Ana Özellikler
1. **Kullanıcı Yetkilendirmesi**
   - JWT tabanlı kimlik doğrulama
   - Rol bazlı erişim kontrolü (Admin, User, Purchaser)
   - Korumalı rotalar

2. **Talep Yönetimi**
   - Yeni satınalma talebi oluşturma
   - Mevcut talepleri listeleme ve filtreleme
   - Talep detaylarını görüntüleme ve düzenleme
   - Talep durumlarını güncelleme
   - Revize ve red işlemleri

3. **SAP Entegrasyonu**
   - SAP OPRQ (Header) ve PRQ1 (Line Items) yapısı ile uyumlu
   - Malzeme kodu (ItemCode) seçimi
   - Tedarikçi (Vendor) seçimi
   - Departman (OcrCode) yönetimi

4. **Excel İşlemleri**
   - Talep listesini Excel'e aktarma
   - Detaylı raporlama özellikleri

5. **Kullanıcı Deneyimi**
   - Modern ve kullanıcı dostu arayüz
   - Responsive tasarım
   - Sayfalama ve filtreleme özellikleri
   - Dosya yükleme ve indirme

## Hedef Kullanıcılar
- **Admin**: Tüm talepleri görüntüleyebilir, düzenleyebilir ve yönetebilir
- **Purchaser**: Satınalma departmanı kullanıcıları, talepleri işleme alır
- **User**: Normal kullanıcılar, kendi taleplerini oluşturabilir ve takip edebilir

## Teknik Gereksinimler
- Modern web tarayıcıları desteği
- SAP Business One API erişimi
- JWT token tabanlı kimlik doğrulama
- Responsive tasarım (mobil ve desktop)

## Başarı Kriterleri
- Satınalma taleplerinin dijital ortamda kolayca yönetilmesi
- SAP sistemi ile sorunsuz entegrasyon
- Kullanıcı dostu ve hızlı arayüz
- Güvenli ve rol bazlı erişim kontrolü
- Taleplerin takip edilebilirliği ve raporlanabilirliği
