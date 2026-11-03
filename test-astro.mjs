import { chromium } from 'playwright';
import fs from 'node:fs';

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('ASTRO BROWSER ERROR:', msg.text());
  });

  await page.goto('http://localhost:4321', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);

  // Take screenshot 1: Astro Main View
  await page.screenshot({ path: 'astro-screenshot-main.png' });
  console.log('Saved astro-screenshot-main.png');

  // Open drawer
  const openBtn = page.locator('.open-dossier-btn').first();
  await openBtn.click();
  await page.waitForTimeout(600);

  // Write a note from an agent in Astro
  await page.fill('#agent-name-input', 'Maria (Speaker Agent)');
  await page.fill('#agent-note-text', 'Revisado en Astro SSR. Conectado al backend persistente para VPS.');
  await page.click('button:has-text("Guardar Nota en Servidor")');
  await page.waitForTimeout(800);

  await page.screenshot({ path: 'astro-screenshot-drawer.png' });
  console.log('Saved astro-screenshot-drawer.png');

  await browser.close();

  // Test API endpoint directly
  const res = await fetch('http://localhost:4321/api/status');
  console.log('API /api/status HTTP status:', res.status);
  const data = await res.json();
  console.log('API Store keys count:', Object.keys(data.store).length);
  console.log('Sample entry in Astro:', JSON.stringify(Object.values(data.store)[0], null, 2));
})();
