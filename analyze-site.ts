import { chromium } from '@playwright/test';

async function analyzeSite() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔍 Site analizi başlıyor...\n');

  try {
    await page.goto('http://167.16.21.50:81/', { waitUntil: 'networkidle', timeout: 30000 });

    // Sayfa başlığı
    const title = await page.title();
    console.log('📄 Sayfa Başlığı:', title);

    // URL
    console.log('🔗 URL:', page.url());

    // Tüm input alanlarını bul
    console.log('\n📝 Input Alanları:');
    const inputs = await page.locator('input').all();
    for (let i = 0; i < inputs.length; i++) {
      const type = await inputs[i].getAttribute('type');
      const name = await inputs[i].getAttribute('name');
      const id = await inputs[i].getAttribute('id');
      const placeholder = await inputs[i].getAttribute('placeholder');
      const className = await inputs[i].getAttribute('class');
      console.log(`  ${i + 1}. Type: ${type}, Name: ${name}, ID: ${id}, Placeholder: ${placeholder}`);
      console.log(`     Class: ${className}`);
    }

    // Tüm butonları bul
    console.log('\n🔘 Butonlar:');
    const buttons = await page.locator('button').all();
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const type = await buttons[i].getAttribute('type');
      const className = await buttons[i].getAttribute('class');
      const id = await buttons[i].getAttribute('id');
      console.log(`  ${i + 1}. Text: "${text?.trim()}", Type: ${type}, ID: ${id}`);
      console.log(`     Class: ${className}`);
    }

    // Tüm linkleri bul
    console.log('\n🔗 Linkler:');
    const links = await page.locator('a').all();
    for (let i = 0; i < Math.min(20, links.length); i++) {
      const href = await links[i].getAttribute('href');
      const text = await links[i].textContent();
      console.log(`  ${i + 1}. Text: "${text?.trim()}", Href: ${href}`);
    }
    if (links.length > 20) {
      console.log(`  ... ve ${links.length - 20} link daha`);
    }

    // Form elemanlarını bul
    console.log('\n📋 Form Elemanları:');
    const forms = await page.locator('form').all();
    console.log(`  Toplam ${forms.length} form bulundu`);
    for (let i = 0; i < forms.length; i++) {
      const action = await forms[i].getAttribute('action');
      const method = await forms[i].getAttribute('method');
      const id = await forms[i].getAttribute('id');
      console.log(`  Form ${i + 1}: Action: ${action}, Method: ${method}, ID: ${id}`);
    }

    // Select/dropdown elemanlarını bul
    console.log('\n📑 Select/Dropdown Elemanları:');
    const selects = await page.locator('select').all();
    for (let i = 0; i < selects.length; i++) {
      const name = await selects[i].getAttribute('name');
      const id = await selects[i].getAttribute('id');
      const options = await selects[i].locator('option').all();
      console.log(`  ${i + 1}. Name: ${name}, ID: ${id}, Seçenek Sayısı: ${options.length}`);
    }

    // Tablolar
    console.log('\n📊 Tablolar:');
    const tables = await page.locator('table').all();
    console.log(`  Toplam ${tables.length} tablo bulundu`);

    // Başlıklar
    console.log('\n📌 Başlıklar:');
    const h1s = await page.locator('h1').allTextContents();
    const h2s = await page.locator('h2').allTextContents();
    const h3s = await page.locator('h3').allTextContents();
    console.log(`  H1 (${h1s.length}):`, h1s.slice(0, 5));
    console.log(`  H2 (${h2s.length}):`, h2s.slice(0, 5));
    console.log(`  H3 (${h3s.length}):`, h3s.slice(0, 5));

    // Modaller/Popup'lar
    console.log('\n💬 Modal/Dialog Elemanları:');
    const modals = await page.locator('[role="dialog"], .modal, .popup, .dialog').all();
    console.log(`  Toplam ${modals.length} modal/dialog bulundu`);

    // Navigation/Menu
    console.log('\n🧭 Navigation/Menu Elemanları:');
    const navs = await page.locator('nav, [role="navigation"]').all();
    console.log(`  Toplam ${navs.length} navigation elemanı bulundu`);
    for (let i = 0; i < navs.length; i++) {
      const navLinks = await navs[i].locator('a').all();
      console.log(`  Navigation ${i + 1}: ${navLinks.length} link içeriyor`);
    }

    // Alert/Error mesajları için konteynerler
    console.log('\n⚠️ Alert/Error Konteynerleri:');
    const alerts = await page.locator('.alert, .error, .warning, .message, [role="alert"]').all();
    console.log(`  Toplam ${alerts.length} alert konteyneri bulundu`);

    // Ekran görüntüsü al
    await page.screenshot({ path: 'analysis-screenshot.png', fullPage: true });
    console.log('\n📸 Tam sayfa ekran görüntüsü kaydedildi: analysis-screenshot.png');

    // Sayfa kaynağını kaydet
    const content = await page.content();
    require('fs').writeFileSync('page-source.html', content);
    console.log('💾 Sayfa HTML kaynağı kaydedildi: page-source.html');

    console.log('\n✅ Analiz tamamlandı!');

  } catch (error) {
    console.error('❌ Hata oluştu:', error);
  } finally {
    // Sayfayı 5 saniye açık tut ki kullanıcı görebilsin
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

analyzeSite();
