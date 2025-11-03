#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports, no-undef */
const { spawn } = require('child_process');
const path = require('path');

const PREVIEW_HOST = process.env.PREVIEW_HOST || '127.0.0.1';
const PREVIEW_PORT = process.env.PREVIEW_PORT || '5177';
const PREVIEW_URL = `http://${PREVIEW_HOST}:${PREVIEW_PORT}`;

async function waitForPreview(child) {
  return new Promise((resolve, reject) => {
    let resolved = false;
    const onData = (data) => {
      const text = data.toString();
      if (text.includes(PREVIEW_URL)) {
        resolved = true;
        cleanup();
        resolve();
      }
    };
    const onError = (data) => {
      if (!resolved) {
        cleanup();
        reject(new Error(data.toString()));
      }
    };
    const onExit = (code) => {
      if (!resolved) {
        cleanup();
        reject(new Error(`vite preview exited prematurely with code ${code}`));
      }
    };
    const cleanup = () => {
      child.stdout.off('data', onData);
      child.stderr.off('data', onError);
      child.off('exit', onExit);
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onError);
    child.on('exit', onExit);
  });
}

async function runNode(script, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [script], { stdio: 'inherit', env: { ...process.env, ...env } });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${script} exited with code ${code}`));
    });
  });
}

(async () => {
  try {
    // Ensure dist is built
    await new Promise((resolve, reject) => {
      const b = spawn('npm', ['run', 'build'], { stdio: 'inherit', env: { ...process.env, VITE_AUDIT_SHIM: 'true' } });
      b.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`build failed: ${code}`))));
    });

    // Start preview
    const preview = spawn('npx', ['vite', 'preview', '--host', PREVIEW_HOST, '--port', PREVIEW_PORT], {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, VITE_AUDIT_SHIM: 'true' },
      stdio: ['inherit', 'pipe', 'pipe']
    });

    console.log(`Starting preview at ${PREVIEW_URL}...`);
    await waitForPreview(preview);
    console.log('Preview is up. Running audits...');

    // Puppeteer diagnostics
    await runNode(path.resolve(__dirname, 'puppeteer-diagnose.cjs'), { PREVIEW_URL });

    // axe-core a11y run
    await runNode(path.resolve(__dirname, 'run-axe.cjs'), { PREVIEW_URL });

    // Optional Lighthouse via lhci if available
    const tryLhci = spawn('npx', ['lhci', 'autorun', `--collect.url=${PREVIEW_URL}`], { stdio: 'inherit' });
    await new Promise((resolve) => tryLhci.on('exit', () => resolve()));

    // Done
    console.log('Audits complete. Shutting down preview...');
    preview.kill('SIGINT');
    process.exit(0);
  } catch (err) {
    console.error('Audit runner failed:', err.message);
    process.exit(1);
  }
})();
