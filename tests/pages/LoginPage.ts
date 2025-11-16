import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestUser } from '../data/users';

/**
 * LoginPage - Login sayfası için Page Object
 */
export class LoginPage extends BasePage {
  // Selectors
  private readonly selectors = {
    companySelect: 'select',
    usernameInput: 'input[type="text"]',
    passwordInput: 'input[type="password"]',
    passwordToggle: 'button[type="button"]', // Şifre göster/gizle
    loginButton: 'button:has-text("Giriş Yap")',
    errorMessage: '.error-message, .error-toast, [role="alert"]',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Login sayfasına git
   * React SPA için elementlerin yüklenmesini bekle
   */
  async navigate(): Promise<void> {
    await this.page.goto('/login', {
      waitUntil: 'domcontentloaded',
      timeout: 120000 // 2 dakika timeout
    });

    // React'in render olmasını bekle - login formu elemanlarını bekle
    await this.waitForSelector('select', 60000).catch(() => {}); // 1 dakika
    await this.wait(2000); // React animasyonları için ekstra bekleme

    // Sayfanın tam yüklenmesini bekle (optional, hata yok sayılır)
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {}); // 30 saniye
  }

  /**
   * Şirket seç
   */
  async selectCompany(index: number): Promise<void> {
    await this.selectOption(this.selectors.companySelect, index);
  }

  /**
   * Kullanıcı adı gir
   */
  async enterUsername(username: string): Promise<void> {
    await this.fillInput(this.selectors.usernameInput, username);
  }

  /**
   * Şifre gir
   */
  async enterPassword(password: string): Promise<void> {
    await this.fillInput(this.selectors.passwordInput, password);
  }

  /**
   * Şifre görünürlüğünü değiştir
   */
  async togglePasswordVisibility(): Promise<void> {
    const toggleButton = this.locator(this.selectors.passwordToggle).first();
    await toggleButton.click();
  }

  /**
   * Giriş yap butonuna tıkla
   */
  async clickLogin(): Promise<void> {
    await this.clickButton('Giriş Yap');
  }

  /**
   * Enter ile giriş yap
   */
  async pressEnter(): Promise<void> {
    await this.page.keyboard.press('Enter');
  }

  /**
   * Login işlemi (tek fonksiyon)
   * Navigation'ı bekler - auth.helper.login() ile uyumlu
   */
  async login(user: TestUser, companyIndex: number = 6): Promise<void> {
    await this.selectCompany(companyIndex);
    await this.wait(1000);
    await this.enterUsername(user.username);
    await this.wait(500);
    await this.enterPassword(user.password);
    await this.wait(500);

    // Login butonuna tıkla ve navigation'ı bekle
    await Promise.all([
      this.page.waitForNavigation({ timeout: 90000, waitUntil: 'domcontentloaded' }), // 90 saniye
      this.clickLogin()
    ]);

    // Sayfanın yüklenmesini bekle
    await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {}); // 1 dakika
    await this.wait(2000);
  }

  /**
   * Login işlemi (username/password ile)
   */
  async loginWithCredentials(
    username: string,
    password: string,
    companyIndex: number = 6
  ): Promise<void> {
    await this.selectCompany(companyIndex);
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  /**
   * Hata mesajını al
   */
  async getErrorMessage(): Promise<string | null> {
    const errorElement = this.locator(this.selectors.errorMessage).first();

    if (await errorElement.isVisible({ timeout: 2000 }).catch(() => false)) {
      return errorElement.textContent();
    }

    return null;
  }

  /**
   * Hata mesajı var mı kontrol et
   */
  async hasErrorMessage(): Promise<boolean> {
    return this.isVisible(this.selectors.errorMessage);
  }

  /**
   * Login formu görünür mü
   */
  async isLoginFormVisible(): Promise<boolean> {
    const companyVisible = await this.isVisible(this.selectors.companySelect);
    const usernameVisible = await this.isVisible(this.selectors.usernameInput);
    const passwordVisible = await this.isVisible(this.selectors.passwordInput);
    const loginButtonVisible = await this.isVisible(this.selectors.loginButton);

    return companyVisible && usernameVisible && passwordVisible && loginButtonVisible;
  }

  /**
   * Giriş butonu enabled mı
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return this.isEnabled(this.selectors.loginButton);
  }

  /**
   * Placeholder kontrolü
   */
  async getUsernamePlaceholder(): Promise<string | null> {
    return this.getAttribute(this.selectors.usernameInput, 'placeholder');
  }

  async getPasswordPlaceholder(): Promise<string | null> {
    return this.getAttribute(this.selectors.passwordInput, 'placeholder');
  }

  /**
   * Şifre inputunun tipini al (visibility toggle kontrolü için)
   */
  async getPasswordInputType(): Promise<string | null> {
    // Toggle sonrası input type değişebilir (password -> text)
    // Her iki durumu da destekleyen selector kullan
    const passwordInput = this.locator('input[type="password"]');
    const textInput = this.locator('input[type="text"]:not(:first-of-type)'); // İkinci text input (username değil)

    // Önce password input'u kontrol et
    if (await passwordInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      return passwordInput.getAttribute('type');
    }

    // Password input yoksa text input'u kontrol et (toggle edilmiş olabilir)
    if (await textInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      return textInput.getAttribute('type');
    }

    return null;
  }

  /**
   * Login başarılı mı kontrol et (URL değişimi)
   */
  async isLoginSuccessful(): Promise<boolean> {
    await this.wait(2000);
    const url = this.page.url();
    return url.includes('/payment/tasks');
  }
}
