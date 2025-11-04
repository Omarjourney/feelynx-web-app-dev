/* eslint-disable security/detect-non-literal-fs-filename */
// scripts/scanForHardcodedPrices.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scanDir = path.join(__dirname, '../src');
const pattern = /\$\d+(\.\d{1,2})?(?!\s*\{)/g; // Match $X.XX but not ${variable}
let found = [];

function scan(folder) {
  if (!fs.existsSync(folder)) {
    console.warn(`⚠️  Scan directory not found: ${folder}`);
    return;
  }

  for (const item of fs.readdirSync(folder)) {
    const fullPath = path.join(folder, item);
    const stat = fs.statSync(fullPath);

    // Skip node_modules, dist, and other build folders
    if (item === 'node_modules' || item === 'dist' || item === '.git') continue;

    if (stat.isDirectory()) {
      scan(fullPath);
    } else if (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Skip lines that are comments or imports
        if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.includes('import')) return;
        
        const matches = line.match(pattern);
        if (matches && !fullPath.includes('config') && !fullPath.includes('test')) {
          found.push({
            file: path.relative(process.cwd(), fullPath),
            line: index + 1,
            content: line.trim(),
            matches
          });
        }
      });
    }
  }
}

console.log('🔍 Scanning frontend for hardcoded prices...\n');
scan(scanDir);

if (found.length) {
  console.warn('⚠️  Found potential hardcoded prices:\n');
  found.forEach(f => {
    console.log(`   ${f.file}:${f.line}`);
    console.log(`   → ${f.content.substring(0, 80)}${f.content.length > 80 ? '...' : ''}`);
    console.log(`   → Matches: ${f.matches.join(', ')}\n`);
  });
  console.warn(`\n⚠️  Total: ${found.length} potential hardcoded price(s) found.`);
  console.warn('   Please ensure all pricing comes from config/pricing.json or config/pricingApp.json\n');
  process.exit(1);
} else {
  console.log('✅ No hardcoded prices found. Safe to deploy.\n');
  process.exit(0);
}
