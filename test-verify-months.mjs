import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4321', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const months = await page.$$eval('.month-section', els => els.map(el => {
    const title = el.querySelector('.month-title-wrap h2 span')?.textContent?.trim();
    const count = parseInt(el.querySelector('.counter-number')?.textContent?.trim() || '0', 10);
    return { title, count };
  }));

  console.log('Visible Months in Accordion:');
  months.forEach(m => console.log(` - ${m.title}: ${m.count} eventos`));
  const totalInMonths = months.reduce((acc, m) => acc + m.count, 0);
  console.log(`\nTOTAL SUMADO DE TODOS LOS MESES: ${totalInMonths} eventos`);

  await page.screenshot({ path: 'C:/Users/jhona/.gemini/antigravity/brain/860300f9-836b-4c21-b8bc-b056a1b04aef/astro-verified-500.png', fullPage: false });
  console.log('Saved screenshot astro-verified-500.png');

  await browser.close();
})();
