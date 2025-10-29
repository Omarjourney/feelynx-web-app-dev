#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { generateImages } from 'pwa-asset-generator';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const source = path.resolve(root, 'public/brand/feelynx-icon.svg');
const output = path.resolve(root, 'public/brand/generated');

async function run() {
  await fs.mkdir(output, { recursive: true });

  console.log(
    `Generating Feelynx icons from ${path.relative(root, source)} → ${path.relative(root, output)}`,
  );

  const { manifestJsonContent } = await generateImages(source, output, {
    background: '#0B0720',
    pathOverride: '/brand/generated',
    favicon: true,
    manifest: true,
    maskable: true,
    apple: true,
    padding: '12%',
    log: true,
  });

  if (manifestJsonContent) {
    const manifestTipPath = path.resolve(output, 'manifest.icons.json');
    await fs.writeFile(manifestTipPath, JSON.stringify(manifestJsonContent, null, 2));
    console.log(`ℹ️  Suggested manifest entries saved to ${path.relative(root, manifestTipPath)}`);
  }

  console.log('✅ Brand icon generation complete.');
}

run().catch((error) => {
  console.error('Failed to generate Feelynx icons:', error);
  process.exitCode = 1;
});
