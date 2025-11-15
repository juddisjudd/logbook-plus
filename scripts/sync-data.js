#!/usr/bin/env node

/**
 * Sync data from arcraiders-data to logbook-overlay
 *
 * Usage:
 *   node scripts/sync-data.js [--arcraiders-data path/to/arcraiders-data] [--check] [--verbose]
 *
 * Options:
 *   --arcraiders-data <path>  Path to arcraiders-data directory (defaults to S:/_projects_/_arc-raiders_/arcraiders-data)
 *   --check                   Only check for changes without syncing
 *   --verbose                 Show detailed output
 *   --help                    Show this help message
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
let arcRaidersData = process.env.ARCRAIDERS_DATA || 'S:/_projects_/_arc-raiders_/arcraiders-data';
let checkOnly = false;
let verbose = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--arcraiders-data' && args[i + 1]) {
    arcRaidersData = args[++i];
  } else if (args[i] === '--check') {
    checkOnly = true;
  } else if (args[i] === '--verbose') {
    verbose = true;
  } else if (args[i] === '--help') {
    console.log(`
Sync data from arcraiders-data to logbook-overlay

Usage:
  node scripts/sync-data.js [options]

Options:
  --arcraiders-data <path>  Path to arcraiders-data directory
  --check                   Only check for changes without syncing
  --verbose                 Show detailed output
  --help                    Show this help message

Examples:
  node scripts/sync-data.js
  node scripts/sync-data.js --check
  node scripts/sync-data.js --arcraiders-data C:/arc-raiders/arcraiders-data
    `);
    process.exit(0);
  }
}

const logbookRoot = path.resolve(__dirname, '..');
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logVerbose(message) {
  if (verbose) {
    log(message, 'blue');
  }
}

log('Syncing data from arcraiders-data...', 'yellow');
log(`Arcraiders Data: ${arcRaidersData}`, 'blue');
log(`Logbook Overlay: ${logbookRoot}`, 'blue');
console.log('');

// Validate arcraiders-data directory exists
if (!fs.existsSync(arcRaidersData)) {
  log(`Error: arcraiders-data directory not found: ${arcRaidersData}`, 'red');
  process.exit(1);
}

// Define data directories to sync
const dataDirs = [
  { name: 'quests', source: path.join(arcRaidersData, 'quests'), dest: path.join(logbookRoot, 'src/data/quests') },
  { name: 'hideout', source: path.join(arcRaidersData, 'hideout'), dest: path.join(logbookRoot, 'src/data/hideout') },
  { name: 'items', source: path.join(arcRaidersData, 'items'), dest: path.join(logbookRoot, 'src/data/items') },
];

let changesMade = 0;

// Sync each directory
for (const dir of dataDirs) {
  syncDirectory(dir.name, dir.source, dir.dest);
}

console.log('');

// Check git status
if (fs.existsSync(path.join(logbookRoot, '.git'))) {
  log('Checking for changes in git...', 'yellow');

  try {
    const gitStatus = execSync('git diff --stat src/data/', {
      cwd: logbookRoot,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    if (!gitStatus) {
      log('✓ No changes detected', 'green');
    } else {
      log('Changes detected in src/data/:', 'yellow');
      console.log(gitStatus);
      console.log('');

      const gitShortStatus = execSync('git status --short src/data/', {
        cwd: logbookRoot,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim();

      if (gitShortStatus) {
        log('Staged files:', 'yellow');
        console.log(gitShortStatus);
      }

      console.log('');
      log(`Run 'git add src/data/' and 'git commit' to save changes`, 'yellow');
    }
  } catch (error) {
    logVerbose(`Git command failed: ${error.message}`);
  }
}

console.log('');
log('Data sync complete!', 'green');

// Helper function to sync a directory
function syncDirectory(name, sourceDir, destDir) {
  if (!fs.existsSync(sourceDir)) {
    log(`✗ Source directory not found: ${sourceDir}`, 'red');
    return;
  }

  if (!fs.existsSync(destDir)) {
    logVerbose(`Creating destination directory: ${destDir}`);
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Get all JSON files from source
  const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.json'));

  if (files.length === 0) {
    log(`! No ${name} files found`, 'yellow');
    return;
  }

  let copiedCount = 0;

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);

    try {
      fs.copyFileSync(sourcePath, destPath);
      copiedCount++;
      logVerbose(`  Copied ${file}`);
    } catch (error) {
      log(`✗ Failed to copy ${file}: ${error.message}`, 'red');
    }
  }

  log(`✓ Synced ${copiedCount} ${name} files`, 'green');
}
