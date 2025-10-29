import { readdirSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const ROOT = new URL('../src/components', import.meta.url).pathname;
const VIOLATIONS = [];

function isPascalCase(name) {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (st.isFile() && ['.tsx', '.ts'].includes(extname(p))) {
      const base = basename(p, extname(p));
      if (!isPascalCase(base)) {
        VIOLATIONS.push(p.replace(process.cwd() + '/', ''));
      }
    }
  }
}

walk(ROOT);

if (VIOLATIONS.length) {
  console.error('Filename case violations (expected PascalCase):');
  for (const v of VIOLATIONS) console.error(' -', v);
  process.exit(1);
} else {
  console.log('All component filenames use PascalCase.');
}
