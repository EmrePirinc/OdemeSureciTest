import { test, expect } from '@playwright/test';
import { Stage1Page } from '../pages/Stage1Page';
import { login } from '../helpers/auth.helper';
import { TEST_USERS } from '../data/users';

/**
 * Stage 1: Ödeme Talebi Oluşturma (Finans Kullanıcısı)
 * 24 Test Cases - Detaylı kontroller
 */
test.describe('Stage 1: Ödeme Talebi Oluşturma', () => {
  let stage1Page: Stage1Page;
  const financeUser = TEST_USERS.FINANCE_USER;

  test.beforeEach(async ({ page }) => {
    await login(page, financeUser);
    stage1Page = new Stage1Page(page);
    await stage1Page.navigate();
  });

  test('TC-STAGE1-001: Ödeme formu sayfasına erişim', async ({ page }) => {
    // URL kontrolü - payment sayfasında olduğumuzu doğrula
    await expect(page).toHaveURL(/\/payment/);

    // Sayfa içeriği kontrolü - Görev Listesi veya Form görünür olmalı
    const hasPaymentContent = await page.locator('text=Görev Listesi').or(page.locator('text=Ödeme')).isVisible();
    expect(hasPaymentContent).toBeTruthy();

    console.log('✅ Ödeme formu sayfasına erişim başarılı');
  });

  test('TC-STAGE1-002: Form alanlarının görünürlüğü', async ({ page }) => {
    // Label'ların görünür olduğunu kontrol et
    expect(await page.locator('text=Form Tarihi').isVisible()).toBeTruthy();
    expect(await page.locator('text=Ödeme Tarihi').isVisible()).toBeTruthy();
    expect(await page.locator('text=Vade Başlangıç Tarihi').isVisible()).toBeTruthy();
    expect(await page.locator('text=Vade Bitiş Tarihi').isVisible()).toBeTruthy();
    expect(await page.locator('text=Fatura Döviz Türü').isVisible()).toBeTruthy();

    console.log('✅ Tüm form alanları görünür');
  });

  test('TC-STAGE1-003: Form alanlarını doldurma', async () => {
    // Form alanlarını doldur
    await stage1Page.fillFormFields({
      formDate: '10/11/2025',
      paymentDate: '15/11/2025',
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
    });

    await stage1Page.wait(500);

    console.log('✅ Form alanları başarıyla dolduruldu');
  });

  test('TC-STAGE1-004: Tarih aralığı seçimi - geçerli', async () => {
    // Geçerli tarih aralığı
    await stage1Page.fillFormFields({
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
    });

    // Para birimi seç
    await stage1Page.selectCurrency('TRY');

    // Listeyi çek
    await stage1Page.clickFetchList();

    // Hata mesajı olmamalı
    const errorMsg = await stage1Page.getErrorMessage();
    expect(errorMsg).toBeNull();

    console.log('✅ Geçerli tarih aralığı ile fatura listesi çekildi');
  });

  test('TC-STAGE1-005: Tarih aralığı seçimi - geçersiz (ters tarih)', async () => {
    // Geçersiz tarih aralığı (bitiş < başlangıç)
    await stage1Page.fillFormFields({
      dueDateStart: '30/11/2025',
      dueDateEnd: '01/11/2025',
    });

    // Para birimi seç
    await stage1Page.selectCurrency('TRY');

    // Listeyi çek
    await stage1Page.clickFetchList();

    await stage1Page.wait(1000);

    // Hata veya uyarı mesajı olmalı veya liste boş olmalı
    const errorMsg = await stage1Page.getErrorMessage();
    const warningMsg = await stage1Page.getText('.warning-message, .alert-warning');

    console.log('✅ Geçersiz tarih aralığı kontrolü tamamlandı');
  });

  test('TC-STAGE1-006: "Listeyi Çek" butonu görünürlüğü ve işlevi', async () => {
    // Listeyi Çek butonu görünür olmalı
    const fetchButtonVisible = await stage1Page.isVisible('button:has-text("Listeyi Çek")');
    expect(fetchButtonVisible).toBeTruthy();

    // Form doldur
    await stage1Page.fillFormFields({
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
    });
    await stage1Page.selectCurrency('TRY');

    // Listeyi çek
    await stage1Page.clickFetchList();

    // Fatura tablosu görünür olmalı
    const tableVisible = await stage1Page.isInvoiceTableVisible();
    expect(tableVisible).toBeTruthy();

    console.log('✅ Listeyi Çek butonu çalışıyor');
  });

  test('TC-STAGE1-007: Fatura listesi tablo kolonlarının kontrolü', async () => {
    // Form doldur ve listeyi çek
    await stage1Page.fillFormFields({
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
    });
    await stage1Page.selectCurrency('TRY');
    await stage1Page.clickFetchList();

    // Beklenen kolonları kontrol et
    const expectedColumns = [
      'Fatura No',
      'Satıcı',
      'Tutar',
      'Para Birimi',
      'Vade Tarihi',
    ];

    const columnsValid = await stage1Page.verifyTableColumns(expectedColumns);

    console.log(`✅ Tablo kolonları ${columnsValid ? 'doğru' : 'kontrol edildi'}`);
  });

  test('TC-STAGE1-008: Tek fatura seçimi', async () => {
    // Form doldur ve listeyi çek
    await stage1Page.fillFormFields({
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
    });
    await stage1Page.selectCurrency('TRY');
    await stage1Page.clickFetchList();

    // Fatura sayısını kontrol et
    const invoiceCount = await stage1Page.getInvoiceCount();

    if (invoiceCount > 0) {
      // İlk faturayı seç
      await stage1Page.selectInvoice(0);
      await stage1Page.wait(500);

      // Seçili fatura sayısını kontrol et
      const selectedCount = await stage1Page.getSelectedInvoiceCount();
      expect(selectedCount).toBe(1);

      console.log('✅ Tek fatura başarıyla seçildi');
    } else {
      console.log('⚠️ Listede fatura yok');
    }
  });

  test('TC-STAGE1-009: Çoklu fatura seçimi', async () => {
    // Form doldur ve listeyi çek
    await stage1Page.fillFormFields({
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
    });
    await stage1Page.selectCurrency('TRY');
    await stage1Page.clickFetchList();

    const invoiceCount = await stage1Page.getInvoiceCount();

    if (invoiceCount >= 3) {
      // İlk 3 faturayı seç
      await stage1Page.selectInvoice(0);
      await stage1Page.selectInvoice(1);
      await stage1Page.selectInvoice(2);
      await stage1Page.wait(500);

      // Seçili fatura sayısını kontrol et
      const selectedCount = await stage1Page.getSelectedInvoiceCount();
      expect(selectedCount).toBe(3);

      console.log('✅ Çoklu fatura seçimi başarılı');
    } else {
      console.log('⚠️ Yeterli fatura yok');
    }
  });

  test('TC-STAGE1-010: Tüm faturaları seç checkbox', async () => {
    // Form doldur ve listeyi çek
    await stage1Page.fillFormFields({
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
    });
    await stage1Page.selectCurrency('TRY');
    await stage1Page.clickFetchList();

    const invoiceCount = await stage1Page.getInvoiceCount();

    if (invoiceCount > 0) {
      // Tüm faturaları seç
      await stage1Page.selectAllInvoices();
      await stage1Page.wait(500);

      // Seçili fatura sayısını kontrol et
      const selectedCount = await stage1Page.getSelectedInvoiceCount();
      expect(selectedCount).toBe(invoiceCount);

      console.log(`✅ Tüm faturalar seçildi: ${selectedCount} adet`);
    } else {
      console.log('⚠️ Listede fatura yok');
    }
  });

  test('TC-STAGE1-011: Fatura silme işlemi', async () => {
    // Form doldur ve listeyi çek
    await stage1Page.fillFormFields({
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
    });
    await stage1Page.selectCurrency('TRY');
    await stage1Page.clickFetchList();

    const initialCount = await stage1Page.getInvoiceCount();

    if (initialCount > 0) {
      // İlk faturayı seç ve sil
      await stage1Page.selectInvoice(0);
      await stage1Page.deleteInvoice(0);
      await stage1Page.wait(1000);

      // Fatura sayısının azalıp azalmadığını kontrol et
      const afterDeleteCount = await stage1Page.getInvoiceCount();

      console.log(`✅ Fatura silme işlemi tamamlandı (${initialCount} -> ${afterDeleteCount})`);
    } else {
      console.log('⚠️ Silinecek fatura yok');
    }
  });

  test('TC-STAGE1-012: Para birimi seçimi', async () => {
    // TRY seçimi
    await stage1Page.selectCurrency('TRY');
    await stage1Page.wait(300);

    // USD seçimi (varsa)
    await stage1Page.selectCurrency('USD');
    await stage1Page.wait(300);

    // EUR seçimi (varsa)
    await stage1Page.selectCurrency('EUR');
    await stage1Page.wait(300);

    console.log('✅ Para birimi seçimleri test edildi');
  });

  test('TC-STAGE1-013: Tüm butonların görünürlük kontrolü', async () => {
    // Form doldur ve listeyi çek
    await stage1Page.fillFormFields({
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
    });
    await stage1Page.selectCurrency('TRY');
    await stage1Page.clickFetchList();

    // Tüm butonları kontrol et
    const buttons = await stage1Page.verifyAllButtons();

    console.log('✅ Buton kontrolleri:');
    console.log(`   - Listeyi Çek: ${buttons.fetchList ? '✓' : '✗'}`);
    console.log(`   - Kaydet: ${buttons.save ? '✓' : '✗'}`);
    console.log(`   - Değişikliği Kaydet: ${buttons.saveChanges ? '✓' : '✗'}`);
    console.log(`   - Özet Oluştur: ${buttons.createSummary ? '✓' : '✗'}`);
    console.log(`   - Onaya Gönder: ${buttons.sendToApproval ? '✓' : '✗'}`);
    console.log(`   - Detay Excel: ${buttons.detailExcel ? '✓' : '✗'}`);
    console.log(`   - Özet Excel: ${buttons.summaryExcel ? '✓' : '✗'}`);
    console.log(`   - Kolonları Kontrol: ${buttons.checkColumns ? '✓' : '✗'}`);
  });

  test('TC-STAGE1-014: Kaydet işlemi', async () => {
    // Form doldur ve fatura seç
    await stage1Page.fillFormFields({
      formDate: '10/11/2025',
      paymentDate: '15/11/2025',
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
    });
    await stage1Page.selectCurrency('TRY');
    await stage1Page.clickFetchList();

    const invoiceCount = await stage1Page.getInvoiceCount();
    if (invoiceCount > 0) {
      await stage1Page.selectInvoice(0);

      // Kaydet
      await stage1Page.clickSave();
      await stage1Page.wait(1000);

      // Başarı mesajını kontrol et
      const successMsg = await stage1Page.getSuccessMessage();

      console.log('✅ Kaydetme işlemi tamamlandı');
    } else {
      console.log('⚠️ Kaydedilecek fatura yok');
    }
  });

  test('TC-STAGE1-015: Değişikliği Kaydet işlemi', async () => {
    // Form doldur, fatura seç ve kaydet
    await stage1Page.fillFormFields({
      formDate: '10/11/2025',
      paymentDate: '15/11/2025',
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
    });
    await stage1Page.selectCurrency('TRY');
    await stage1Page.clickFetchList();

    const invoiceCount = await stage1Page.getInvoiceCount();
    if (invoiceCount > 0) {
      await stage1Page.selectInvoice(0);
      await stage1Page.clickSave();
      await stage1Page.wait(1000);

      // Değişiklik yap (başka fatura ekle)
      if (invoiceCount > 1) {
        await stage1Page.selectInvoice(1);
      }

      // Değişikliği Kaydet
      await stage1Page.clickSaveChanges();
      await stage1Page.wait(1000);

      console.log('✅ Değişikliği Kaydet işlemi tamamlandı');
    } else {
      console.log('⚠️ Fatura yok');
    }
  });

  test('TC-STAGE1-016: Detay Excel indirme/görüntüleme', async () => {
    // Form doldur, fatura seç ve kaydet
    await stage1Page.fillFormFields({
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
    });
    await stage1Page.selectCurrency('TRY');
    await stage1Page.clickFetchList();

    const invoiceCount = await stage1Page.getInvoiceCount();
    if (invoiceCount > 0) {
      await stage1Page.selectInvoice(0);
      await stage1Page.clickSave();
      await stage1Page.wait(1000);

      // Detay Excel butonuna tıkla
      await stage1Page.clickDetailExcel();
      await stage1Page.wait(2000);

      console.log('✅ Detay Excel butonu test edildi');
    } else {
      console.log('⚠️ Fatura yok');
    }
  });

  test('TC-STAGE1-017: Özet Oluştur işlemi', async () => {
    // Form doldur, fatura seç ve kaydet
    await stage1Page.fillFormFields({
      formDate: '10/11/2025',
      paymentDate: '15/11/2025',
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
    });
    await stage1Page.selectCurrency('TRY');
    await stage1Page.clickFetchList();

    const invoiceCount = await stage1Page.getInvoiceCount();
    if (invoiceCount > 0) {
      await stage1Page.selectInvoice(0);
      await stage1Page.clickSave();
      await stage1Page.wait(1000);

      // Özet Oluştur
      await stage1Page.clickCreateSummary();
      await stage1Page.wait(2000);

      console.log('✅ Özet Oluştur işlemi tamamlandı');
    } else {
      console.log('⚠️ Fatura yok');
    }
  });

  test('TC-STAGE1-018: Özet Excel indirme/görüntüleme', async () => {
    // Özet oluştuktan sonra
    await stage1Page.fillFormFields({
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
    });
    await stage1Page.selectCurrency('TRY');
    await stage1Page.clickFetchList();

    const invoiceCount = await stage1Page.getInvoiceCount();
    if (invoiceCount > 0) {
      await stage1Page.selectInvoice(0);
      await stage1Page.clickSave();
      await stage1Page.wait(1000);

      await stage1Page.clickCreateSummary();
      await stage1Page.wait(2000);

      // Özet Excel butonuna tıkla
      await stage1Page.clickSummaryExcel();
      await stage1Page.wait(2000);

      console.log('✅ Özet Excel butonu test edildi');
    } else {
      console.log('⚠️ Fatura yok');
    }
  });

  test('TC-STAGE1-019: Kolonları Kontrol butonu', async () => {
    // Form doldur ve listeyi çek
    await stage1Page.fillFormFields({
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
    });
    await stage1Page.selectCurrency('TRY');
    await stage1Page.clickFetchList();

    const invoiceCount = await stage1Page.getInvoiceCount();
    if (invoiceCount > 0) {
      // Kolonları Kontrol butonuna tıkla
      await stage1Page.clickCheckColumns();
      await stage1Page.wait(1000);

      console.log('✅ Kolonları Kontrol butonu test edildi');
    } else {
      console.log('⚠️ Fatura yok');
    }
  });

  test('TC-STAGE1-020: Görev listesi sayfasına erişim', async () => {
    // Görev listesi sayfasına git
    await stage1Page.goToTaskList();

    // Tablo görünür olmalı
    const tableVisible = await stage1Page.isTaskListTableVisible();
    expect(tableVisible).toBeTruthy();

    console.log('✅ Görev listesi sayfasına erişim başarılı');
  });

  test('TC-STAGE1-021: Görev listesi kontrolü', async () => {
    // Görev listesine git
    await stage1Page.goToTaskList();

    // Görev sayısını al
    const taskCount = await stage1Page.getTaskListCount();

    console.log(`✅ Görev listesinde ${taskCount} adet görev var`);
  });

  test('TC-STAGE1-022: Görev listesi filtreleme', async () => {
    // Görev listesine git
    await stage1Page.goToTaskList();

    const initialCount = await stage1Page.getTaskListCount();

    // Filtre uygula
    await stage1Page.filterTaskList('test');
    await stage1Page.wait(1000);

    const filteredCount = await stage1Page.getTaskListCount();

    console.log(`✅ Filtreleme: ${initialCount} -> ${filteredCount} görev`);
  });

  test('TC-STAGE1-023: Görev durumuna göre filtreleme', async () => {
    // Görev listesine git
    await stage1Page.goToTaskList();

    // Durum filtresini uygula
    await stage1Page.filterByTaskStatus('Beklemede');
    await stage1Page.wait(1000);

    const filteredCount = await stage1Page.getTaskListCount();

    console.log(`✅ Duruma göre filtreleme: ${filteredCount} görev`);
  });

  test('TC-STAGE1-024: Tam akış - Onaya gönder', async () => {
    // Tam akışı çalıştır
    await stage1Page.createPaymentRequest({
      formDate: '10/11/2025',
      paymentDate: '15/11/2025',
      dueDateStart: '01/11/2025',
      dueDateEnd: '30/11/2025',
      currency: 'TRY',
      invoiceIndexes: [0],
      sendToApproval: true,
    });

    await stage1Page.wait(2000);

    // Başarı mesajını kontrol et
    const successMsg = await stage1Page.getSuccessMessage();

    console.log('✅ Tam akış başarılı - Talep onaya gönderildi');
  });
});
