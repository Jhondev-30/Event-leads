import { chromium } from 'playwright';
import fs from 'node:fs';

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('ERROR:', msg.text());
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);

  // Screenshot 1: Main View
  await page.screenshot({ path: 'screenshot-v2-main.png' });
  console.log('Saved screenshot-v2-main.png');

  // Test opening drawer
  const dossierBtn = page.locator('.open-dossier-btn').first();
  await dossierBtn.click();
  await page.waitForTimeout(600);

  // Type a team note
  await page.fill('#agent-name-input', 'Carlos (Lead Agent)');
  await page.fill('#agent-note-text', 'Contactado vía LinkedIn el 3 de Noviembre. Enviada propuesta de keynote.');
  
  // Click save note
  await page.click('button:has-text("Guardar Nota en Servidor")');
  await page.waitForTimeout(700);

  await page.screenshot({ path: 'screenshot-v2-drawer.png' });
  console.log('Saved screenshot-v2-drawer.png');

  await browser.close();

  // Verify status-store.json
  const storePath = 'c:/Users/jhona/Documents/Antigravity proyects/busqueda de eventos/status-store.json';
  if (fs.existsSync(storePath)) {
    const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    console.log('Server status-store.json keys count:', Object.keys(store).length);
    console.log('Saved entry sample:', JSON.stringify(Object.values(store)[0], null, 2));
  }
})();
