import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Stage1Page - Stage 1 (Ödeme Talebi Oluşturma) sayfası için Page Object
 * Finans Kullanıcısı tarafından kullanılır
 */
export class Stage1Page extends BasePage {
  // Selectors
  private readonly selectors = {
    // Form alanları - Label-based selectors
    formDateLabel: 'text=Form Tarihi',
    paymentDateLabel: 'text=Ödeme Tarihi',
    dueDateStartLabel: 'text=Vade Başlangıç Tarihi',
    dueDateEndLabel: 'text=Vade Bitiş Tarihi',

    // Date inputs by placeholder
    dateInputGeneric: 'input[placeholder*="GG"]',  // Tüm tarih inputları
    dateInputs: 'input[type="date"], input[placeholder*="GG/AA"]',

    // Para birimi seçimi
    currencyLabel: 'text=Fatura Döviz Türü',
    currencySelect: 'select[name="currency"], select:has(option:has-text("TRY"))',
    currencyDropdown: 'button:has-text("TRY"), button:has-text("USD"), button:has-text("EUR")',

    // Listeyi çek butonu
    fetchListButton: 'button:has-text("Listeyi Çek")',

    // Fatura listesi
    invoiceTable: 'table',
    invoiceRow: 'table tbody tr',
    invoiceCheckbox: 'input[type="checkbox"]',
    selectAllCheckbox: 'thead input[type="checkbox"]',

    // Fatura detayları
    invoiceNumber: '[data-field="invoiceNumber"]',
    vendorName: '[data-field="vendorName"]',
    amount: '[data-field="amount"]',
    currency: '[data-field="currency"]',

    // Buttons
    saveButton: 'button:has-text("Kaydet")',
    saveChangesButton: 'button:has-text("Değişikliği Kaydet")',
    createSummaryButton: 'button:has-text("Özet Oluştur")',
    sendToApprovalButton: 'button:has-text("Onaya Gönder")',
    cancelButton: 'button:has-text("İptal")',
    deleteInvoiceButton: 'button:has-text("Sil")',
    detailExcelButton: 'button:has-text("Detay Excel"), a:has-text("Detay Excel")',
    summaryExcelButton: 'button:has-text("Özet Excel"), a:has-text("Özet Excel")',
    checkColumnsButton: 'button:has-text("Kolonları Kontrol")',

    // Görev listesi
    taskListTable: 'table',
    taskListRow: 'table tbody tr',
    taskListFilter: 'input[placeholder*="Filtre"], input[type="search"]',
    taskStatusFilter: 'select[name="status"]',
    taskDateFilter: 'input[type="date"]',

    // Mesajlar
    successMessage: '.success-message, .alert-success',
    errorMessage: '.error-message, .alert-error',
    validationError: '.validation-error',
    warningMessage: '.warning-message, .alert-warning',

    // Sayfa başlığı
    pageTitle: 'h1, h2',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Stage 1 sayfasına git
   * Login sonrası zaten ödeme formu sayfasındayız, sadece sayfanın yüklendiğinden emin olalım
   */
  async navigate(): Promise<void> {
    // Sayfanın yüklendiğinden emin ol
    await this.wait(500);

    // Ödeme formu elementlerinin görünür olup olmadığını kontrol et
    const formTitleVisible = await this.page.locator('text=Ödeme Bilgileri').or(this.page.locator('text=Görev Listesi')).isVisible({ timeout: 3000 }).catch(() => false);

    if (!formTitleVisible) {
      console.warn('⚠️ Form veya görev listesi bulunamadı, sayfa yükleniyor olabilir...');
      await this.wait(1000);
    }
  }

  /**
   * Form alanlarını doldur - Label-based approach
   */
  async fillFormFields(data: {
    formDate?: string;
    paymentDate?: string;
    dueDateStart?: string;
    dueDateEnd?: string;
  }): Promise<void> {
    // Form Tarihi'nin yanındaki input'u bul
    if (data.formDate) {
      const formDateInput = this.page.locator('text=Form Tarihi').locator('..').locator('input').first();
      await formDateInput.fill(data.formDate);
      await this.wait(300);
    }

    // Ödeme Tarihi'nin yanındaki input'u bul
    if (data.paymentDate) {
      const paymentDateInput = this.page.locator('text=Ödeme Tarihi').locator('..').locator('input').first();
      await paymentDateInput.fill(data.paymentDate);
      await this.wait(300);
    }

    // Vade Başlangıç Tarihi'nin yanındaki input'u bul
    if (data.dueDateStart) {
      const dueDateStartInput = this.page.locator('text=Vade Başlangıç Tarihi').locator('..').locator('input').first();
      await dueDateStartInput.fill(data.dueDateStart);
      await this.wait(300);
    }

    // Vade Bitiş Tarihi'nin yanındaki input'u bul
    if (data.dueDateEnd) {
      const dueDateEndInput = this.page.locator('text=Vade Bitiş Tarihi').locator('..').locator('input').first();
      await dueDateEndInput.fill(data.dueDateEnd);
      await this.wait(300);
    }
  }

  /**
   * "Listeyi Çek" butonuna tıkla
   */
  async clickFetchList(): Promise<void> {
    await this.clickButton('Listeyi Çek');
    await this.wait(2000); // Fatura listesinin yüklenmesini bekle
  }

  /**
   * Fatura sayısını al
   */
  async getInvoiceCount(): Promise<number> {
    return this.getCount(this.selectors.invoiceRow);
  }

  /**
   * Belirli bir faturayı seç (index'e göre)
   */
  async selectInvoice(index: number): Promise<void> {
    const checkbox = this.page.locator(this.selectors.invoiceRow).nth(index).locator('input[type="checkbox"]');
    await checkbox.check();
  }

  /**
   * Tüm faturaları seç
   */
  async selectAllInvoices(): Promise<void> {
    await this.check(this.selectors.selectAllCheckbox);
    await this.wait(500);
  }

  /**
   * Seçili fatura sayısını al
   */
  async getSelectedInvoiceCount(): Promise<number> {
    const checkedBoxes = this.page.locator('input[type="checkbox"]:checked');
    const count = await checkedBoxes.count();
    // Başlıktaki "select all" checkbox'ı çıkar
    return Math.max(0, count - 1);
  }

  /**
   * Fatura detaylarını al
   */
  async getInvoiceDetails(index: number): Promise<{
    invoiceNumber: string | null;
    vendorName: string | null;
    amount: string | null;
    currency: string | null;
  }> {
    const row = this.page.locator(this.selectors.invoiceRow).nth(index);

    return {
      invoiceNumber: await row.locator('td').nth(1).textContent(),
      vendorName: await row.locator('td').nth(2).textContent(),
      amount: await row.locator('td').nth(3).textContent(),
      currency: await row.locator('td').nth(4).textContent(),
    };
  }

  /**
   * Para birimi seç
   */
  async selectCurrency(currency: string): Promise<void> {
    const currencySelect = this.page.locator(this.selectors.currencySelect);

    if (await currencySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await currencySelect.selectOption({ label: currency });
    } else {
      // Dropdown varsa
      await this.clickButton(currency);
    }
  }

  /**
   * Kaydet butonuna tıkla
   */
  async clickSave(): Promise<void> {
    await this.clickButton('Kaydet');
    await this.wait(1500);
  }

  /**
   * Özet Oluştur butonuna tıkla
   */
  async clickCreateSummary(): Promise<void> {
    await this.clickButton('Özet Oluştur');
    await this.wait(2000);
  }

  /**
   * Onaya Gönder butonuna tıkla
   */
  async clickSendToApproval(): Promise<void> {
    await this.clickButton('Onaya Gönder');
    await this.wait(2000);
  }

  /**
   * Değişikliği Kaydet butonuna tıkla
   */
  async clickSaveChanges(): Promise<void> {
    await this.clickButton('Değişikliği Kaydet');
    await this.wait(1500);
  }

  /**
   * Seçili faturayı sil
   */
  async deleteInvoice(index: number): Promise<void> {
    const row = this.page.locator(this.selectors.invoiceRow).nth(index);
    const deleteButton = row.locator('button:has-text("Sil")');

    if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteButton.click();
      await this.wait(1000);

      // Onay popup'ı varsa onayla
      const confirmButton = this.page.locator('button:has-text("Evet"), button:has-text("Onayla"), button:has-text("Tamam")').first();
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
        await this.wait(500);
      }
    }
  }

  /**
   * Detay Excel butonuna tıkla
   */
  async clickDetailExcel(): Promise<void> {
    const detailExcelBtn = this.page.locator(this.selectors.detailExcelButton).first();

    if (await detailExcelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await detailExcelBtn.click();
      await this.wait(2000); // Excel indirmesi için bekle
    }
  }

  /**
   * Özet Excel butonuna tıkla
   */
  async clickSummaryExcel(): Promise<void> {
    const summaryExcelBtn = this.page.locator(this.selectors.summaryExcelButton).first();

    if (await summaryExcelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await summaryExcelBtn.click();
      await this.wait(2000); // Excel indirmesi için bekle
    }
  }

  /**
   * Kolonları Kontrol butonuna tıkla
   */
  async clickCheckColumns(): Promise<void> {
    await this.clickButton('Kolonları Kontrol');
    await this.wait(1000);
  }

  /**
   * Tablo kolonlarını doğrula
   */
  async verifyTableColumns(expectedColumns: string[]): Promise<boolean> {
    const tableHeaders = this.page.locator('table thead th');
    const headerCount = await tableHeaders.count();

    const actualColumns: string[] = [];

    for (let i = 0; i < headerCount; i++) {
      const headerText = await tableHeaders.nth(i).textContent();
      if (headerText) {
        actualColumns.push(headerText.trim());
      }
    }

    // Beklenen kolonların hepsinin mevcut olup olmadığını kontrol et
    for (const expectedCol of expectedColumns) {
      const found = actualColumns.some(actual => actual.includes(expectedCol));
      if (!found) {
        console.log(`⚠️ Kolon bulunamadı: ${expectedCol}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Tüm butonların görünürlüğünü kontrol et
   */
  async verifyAllButtons(): Promise<{
    fetchList: boolean;
    save: boolean;
    saveChanges: boolean;
    createSummary: boolean;
    sendToApproval: boolean;
    detailExcel: boolean;
    summaryExcel: boolean;
    checkColumns: boolean;
  }> {
    return {
      fetchList: await this.isVisible(this.selectors.fetchListButton),
      save: await this.isVisible(this.selectors.saveButton),
      saveChanges: await this.isVisible(this.selectors.saveChangesButton),
      createSummary: await this.isVisible(this.selectors.createSummaryButton),
      sendToApproval: await this.isVisible(this.selectors.sendToApprovalButton),
      detailExcel: await this.isVisible(this.selectors.detailExcelButton),
      summaryExcel: await this.isVisible(this.selectors.summaryExcelButton),
      checkColumns: await this.isVisible(this.selectors.checkColumnsButton),
    };
  }

  /**
   * Görev listesi sayfasına git
   */
  async goToTaskList(): Promise<void> {
    await this.goto('/payment/tasks');
    await this.wait(1000);
  }

  /**
   * Görev listesi sayısını al
   */
  async getTaskListCount(): Promise<number> {
    return this.getCount(this.selectors.taskListRow);
  }

  /**
   * Görev listesini filtrele
   */
  async filterTaskList(filterText: string): Promise<void> {
    const filterInput = this.page.locator(this.selectors.taskListFilter).first();

    if (await filterInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await filterInput.fill(filterText);
      await this.wait(1000); // Filtreleme için bekle
    }
  }

  /**
   * Görev durumuna göre filtrele
   */
  async filterByTaskStatus(status: string): Promise<void> {
    const statusFilter = this.page.locator(this.selectors.taskStatusFilter).first();

    if (await statusFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusFilter.selectOption({ label: status });
      await this.wait(1000);
    }
  }

  /**
   * Görev listesi tablosunun görünür olup olmadığını kontrol et
   */
  async isTaskListTableVisible(): Promise<boolean> {
    return this.isVisible(this.selectors.taskListTable);
  }

  /**
   * Başarı mesajını al
   */
  async getSuccessMessage(): Promise<string | null> {
    const successMsg = this.page.locator(this.selectors.successMessage).first();

    if (await successMsg.isVisible({ timeout: 3000 }).catch(() => false)) {
      return successMsg.textContent();
    }

    return null;
  }

  /**
   * Hata mesajını al
   */
  async getErrorMessage(): Promise<string | null> {
    const errorMsg = this.page.locator(this.selectors.errorMessage).first();

    if (await errorMsg.isVisible({ timeout: 3000 }).catch(() => false)) {
      return errorMsg.textContent();
    }

    return null;
  }

  /**
   * Validation hatası var mı kontrol et
   */
  async hasValidationError(): Promise<boolean> {
    return this.isVisible(this.selectors.validationError);
  }

  /**
   * Sayfa başlığını al
   */
  async getPageTitle(): Promise<string | null> {
    return this.getText(this.selectors.pageTitle);
  }

  /**
   * Fatura tablosu görünür mü
   */
  async isInvoiceTableVisible(): Promise<boolean> {
    return this.isVisible(this.selectors.invoiceTable);
  }

  /**
   * Temizle butonuna tıkla
   */
  async clickClearFilter(): Promise<void> {
    await this.clickButton('Temizle');
    await this.wait(500);
  }

  /**
   * Tüm formu doldur ve ödeme talebi oluştur (Full flow)
   */
  async createPaymentRequest(data: {
    formDate?: string;
    paymentDate?: string;
    dueDateStart: string;
    dueDateEnd: string;
    currency: string;
    invoiceIndexes: number[];
    sendToApproval?: boolean;
  }): Promise<void> {
    // 1. Form alanlarını doldur
    await this.fillFormFields({
      formDate: data.formDate,
      paymentDate: data.paymentDate,
      dueDateStart: data.dueDateStart,
      dueDateEnd: data.dueDateEnd,
    });

    // 2. Para birimi seç
    await this.selectCurrency(data.currency);

    // 3. Listeyi çek
    await this.clickFetchList();

    // 4. Faturaları seç
    for (const index of data.invoiceIndexes) {
      await this.selectInvoice(index);
    }

    // 5. Kaydet
    await this.clickSave();

    // 6. Özet oluştur
    await this.clickCreateSummary();

    // 7. Onaya gönder (opsiyonel)
    if (data.sendToApproval) {
      await this.clickSendToApproval();
    }
  }
}
