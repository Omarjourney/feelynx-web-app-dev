#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports, no-undef, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-expressions */
/**
 * Puppeteer diagnostics: console logs, page errors, failed requests, screenshot.
 * Run with PREVIEW_URL=http://127.0.0.1:5177 node ./scripts/puppeteer-diagnose.cjs
 * Output: ./lhci/puppeteer-logs.json and /tmp/feelynx_puppeteer.png
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const PREVIEW_URL = process.env.PREVIEW_URL || 'http://127.0.0.1:5175';
const OUT_LOG = path.resolve(process.cwd(), 'lhci', 'puppeteer-logs.json');
const OUT_SCREEN = '/tmp/feelynx_puppeteer.png';

(async function main() {
  const logs = {
    url: PREVIEW_URL,
    timestamp: new Date().toISOString(),
    console: [],
    pageErrors: [],
    requestFailures: [],
    responses: [],
  };

  console.log('Launching puppeteer...');
  const executable = process.env.CHROME_PATH || '/snap/bin/chromium';
  console.log('Using Chrome executable:', executable);
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executable,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  const page = await browser.newPage();

  page.on('console', msg => {
    const args = msg.args().map(a => {
      try { return a.jsonValue(); } catch (e) { return String(a); }
    });
    const entry = {type: msg.type(), text: msg.text(), args, timestamp: Date.now()};
    logs.console.push(entry);
    console[msg.type()] && console[msg.type()](msg.text());
  });

  page.on('pageerror', err => {
    const entry = {message: err.message, stack: err.stack, timestamp: Date.now()};
    logs.pageErrors.push(entry);
    console.error('PAGE ERROR:', err.message);
  });

  page.on('requestfailed', req => {
    logs.requestFailures.push({
      url: req.url(),
      method: req.method(),
      failure: req.failure() && req.failure().errorText,
      timestamp: Date.now()
    });
    console.warn('REQUEST FAILED:', req.method(), req.url());
  });

  page.on('response', async res => {
    try {
      const ct = res.headers()['content-type'] || '';
      logs.responses.push({
        url: res.url(),
        status: res.status(),
        ok: res.ok(),
        contentType: ct,
        timestamp: Date.now()
      });
    } catch (e) {
      // ignore
    }
  });

  try {
    console.log('Navigating to', PREVIEW_URL);
    await page.goto(PREVIEW_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  } catch (err) {
    console.error('Navigation error:', err && err.message);
    logs.navigationError = (err && err.message) || 'navigation error';
  }

  // Wait a bit for any late runtime errors
  await new Promise((r) => setTimeout(r, 5000));

  // Capture screenshot
  try {
    await page.screenshot({ path: OUT_SCREEN, fullPage: true });
    console.log('Wrote screenshot to', OUT_SCREEN);
    logs.screenshot = OUT_SCREEN;
  } catch (err) {
    console.error('Screenshot error:', err && err.message);
    logs.screenshotError = err && err.message;
  }

  // Save logs
  try {
    fs.mkdirSync(path.dirname(OUT_LOG), { recursive: true });
    fs.writeFileSync(OUT_LOG, JSON.stringify(logs, null, 2));
    console.log('Wrote logs to', OUT_LOG);
  } catch (err) {
    console.error('Failed to write logs:', err && err.message);
  }

  await browser.close();
  console.log('Puppeteer run complete.');
})();
