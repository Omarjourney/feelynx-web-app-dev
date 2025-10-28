#!/usr/bin/env node

import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative, sep } from 'node:path';
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync
} from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');

const args = process.argv.slice(2);

const commands = {
  info: {
    description: 'Display repository metadata and useful scripts.',
    run: () => {
      const pkgPath = resolve(repoRoot, 'package.json');
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      console.log(`Repository: ${pkg.name}`);
      console.log(`Version: ${pkg.version}`);
      if (pkg.description) {
        console.log(`Description: ${pkg.description}`);
      }
      console.log('\nAvailable npm scripts:');
      const scriptNames = Object.keys(pkg.scripts ?? {});
      if (scriptNames.length === 0) {
        console.log('  (none defined)');
      } else {
        for (const name of scriptNames) {
          console.log(`  - ${name}`);
        }
      }
      const docsDir = resolve(repoRoot, 'docs');
      if (existsSync(docsDir)) {
        console.log('\nKey documentation files:');
        for (const entry of readdirSync(docsDir)) {
          console.log(`  - docs/${entry}`);
        }
      }
    }
  },
  ls: {
    description: 'List files relative to the repository root.',
    usage: 'codex ls [path]',
    run: (pathArg = '.') => {
      const targetPath = resolvePath(pathArg);
      const stats = statSync(targetPath);
      if (!stats.isDirectory()) {
        console.error('codex ls expects a directory path.');
        process.exitCode = 1;
        return;
      }
      for (const entry of readdirSync(targetPath)) {
        const entryPath = resolve(targetPath, entry);
        const entryStat = statSync(entryPath);
        const indicator = entryStat.isDirectory() ? '/' : '';
        console.log(entry + indicator);
      }
    }
  },
  cat: {
    description: 'Print the contents of a file in the repository.',
    usage: 'codex cat <path>',
    run: (pathArg) => {
      if (!pathArg) {
        console.error('codex cat requires a file path.');
        process.exitCode = 1;
        return;
      }
      const targetPath = resolvePath(pathArg);
      const stats = statSync(targetPath);
      if (!stats.isFile()) {
        console.error('codex cat requires a path to a file.');
        process.exitCode = 1;
        return;
      }
      process.stdout.write(readFileSync(targetPath, 'utf8'));
    }
  },
  help: {
    description: 'Show available commands and usage information.',
    run: showHelp
  }
};

function resolvePath(pathArg) {
  const targetPath = resolve(repoRoot, pathArg);
  const relativePath = relative(repoRoot, targetPath);
  const segments = relativePath.split(sep);
  if (relativePath.startsWith('..') || segments.includes('..')) {
    console.error('Path must stay within the repository.');
    process.exit(1);
  }
  if (!existsSync(targetPath)) {
    console.error(`Path not found: ${pathArg}`);
    process.exit(1);
  }
  return targetPath;
}

function showHelp() {
  console.log('Feelynx Codex CLI');
  console.log('Usage: codex <command> [args]\n');
  console.log('Commands:');
  for (const [name, command] of Object.entries(commands)) {
    if (name === 'help') continue;
    const usage = command.usage ? `\n    ${command.usage}` : '';
    console.log(`  ${name} - ${command.description}${usage}`);
  }
  console.log('\nRun "codex help" to view this message.');
}

const [commandName, ...commandArgs] = args;

if (!commandName || !(commandName in commands)) {
  showHelp();
  if (commandName && !(commandName in commands)) {
    process.exitCode = 1;
  }
} else {
  const command = commands[commandName];
  command.run(...commandArgs);
}
