import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { spawnSync } from 'child_process';

const command = process.argv[2];
const root = process.cwd();
const ignoredDirs = new Set(['.git', 'coverage', 'node_modules']);
const lintExtensions = new Set(['.js']);
const formatExtensions = new Set(['.css', '.html', '.js', '.json', '.md', '.yml']);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        walk(join(dir, entry.name), files);
      }
      continue;
    }

    files.push(join(dir, entry.name));
  }

  return files;
}

function hasExtension(file, extensions) {
  return extensions.has(file.slice(file.lastIndexOf('.')));
}

function normalizeText(value) {
  const newline = value.includes('\r\n') ? '\r\n' : '\n';
  return value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n*$/, '\n')
    .replace(/\n/g, newline);
}

function runLint() {
  const files = walk(root).filter((file) => hasExtension(file, lintExtensions));
  const failed = [];

  for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    if (result.status !== 0) {
      failed.push(relative(root, file));
      process.stderr.write(result.stderr || result.stdout);
    }
  }

  if (failed.length > 0) {
    throw new Error(`Syntax check failed: ${failed.join(', ')}`);
  }
}

function runFormat({ write }) {
  const files = walk(root).filter((file) => hasExtension(file, formatExtensions));
  const changed = [];

  for (const file of files) {
    const original = readFileSync(file, 'utf8');
    const normalized = normalizeText(original);

    if (normalized !== original) {
      changed.push(relative(root, file));
      if (write) {
        writeFileSync(file, normalized);
      }
    }
  }

  if (changed.length > 0 && !write) {
    throw new Error(`Formatting check failed: ${changed.join(', ')}`);
  }

  if (changed.length > 0) {
    console.log(`Formatted ${changed.length} file(s).`);
  }
}

try {
  if (command === 'lint') {
    runLint();
  } else if (command === 'format') {
    runFormat({ write: true });
  } else if (command === 'format:check') {
    runFormat({ write: false });
  } else {
    throw new Error('Usage: node scripts/quality.js <lint|format|format:check>');
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
