import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4, // Paralel worker sayısı 4'e düşürüldü (sunucu yükü için)
  reporter: 'html',
  timeout: 180000, // 3 dakika test timeout
  use: {
    baseURL: 'http://167.16.21.50:81',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure', // Sadece hatalı testlerde video kaydet
    navigationTimeout: 120000, // 2 dakika navigation timeout
    actionTimeout: 60000, // 1 dakika action timeout
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        video: 'off', // WebKit Windows video kayıt hatası için kapatıldı
      },
    },
  ],
});
