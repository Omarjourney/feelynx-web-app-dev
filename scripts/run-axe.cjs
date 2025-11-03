#!/usr/bin/env node
// Run axe-core against a live, rendered page in Chromium via Puppeteer
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const PREVIEW_URL = process.env.PREVIEW_URL || 'http://127.0.0.1:5175';
  const OUT_PATH = path.resolve(process.cwd(), 'lhci', 'axe-report.json');
  const executable = process.env.CHROME_PATH || '/snap/bin/chromium';
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: executable,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    const page = await browser.newPage();
    await page.goto(PREVIEW_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    // Inject axe-core into the page context
    const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
    await page.addScriptTag({ content: axeSource });

    // Run axe within the browser context
    const results = await page.evaluate(async () => {
      // Configure rules to skip heavy/unsupported checks if needed
      const context = document;
      const options = {};
      return await window.axe.run(context, options);
    });

    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));
    console.log('axe report written to ./lhci/axe-report.json');

    await browser.close();
  } catch (err) {
    console.error('Error running axe:', err && err.message);
    process.exit(1);
  }
})();
