# Data Sync Scripts

These scripts help you keep the Logbook+ data files synchronized with the latest updates from the [arcraiders-data](https://github.com/arc-raiders/arcraiders-data) repository.

## Available Scripts

### Node.js Script (Recommended)

The primary sync script is written in Node.js and is the most flexible option.

#### Usage

```bash
# Sync all data files
bun sync-data
# or
node scripts/sync-data.js

# Check for changes without syncing
bun sync-data:check
# or
node scripts/sync-data.js --check

# Verbose output showing each file copied
bun sync-data:verbose
# or
node scripts/sync-data.js --verbose

# Show help
node scripts/sync-data.js --help
```

#### Options

- `--arcraiders-data <path>` - Specify the path to arcraiders-data directory (defaults to `S:/_projects_/_arc-raiders_/arcraiders-data`)
- `--check` - Only check for changes without syncing
- `--verbose` - Show detailed output including each file being copied
- `--help` - Show help message

#### Environment Variables

You can set the `ARCRAIDERS_DATA` environment variable to override the default path:

```bash
# Windows
set ARCRAIDERS_DATA=C:\path\to\arcraiders-data
bun sync-data

# Linux/Mac
export ARCRAIDERS_DATA=/path/to/arcraiders-data
bun sync-data
```

### Windows Batch Script

A batch file is provided for Windows users who prefer not to use Node.js.

```bash
scripts\sync-data.bat
```

The script will:
1. Copy all JSON files from arcraiders-data to the logbook data directory
2. Show git status if the project is a git repository
3. Pause to allow you to review the changes

### Bash Script

A bash script is provided for Linux/Mac users.

```bash
scripts/sync-data.sh
```

## What Gets Synced

The scripts synchronize the following directories:

- **Quests** - All quest definitions from `arcraiders-data/quests/` → `src/data/quests/`
- **Hideout** - Hideout facility data from `arcraiders-data/hideout/` → `src/data/hideout/`
- **Items** - Item definitions from `arcraiders-data/items/` → `src/data/items/`

## Workflow

### Checking for Updates

1. Pull the latest changes from arcraiders-data repository:
   ```bash
   cd S:\_projects_\_arc-raiders_\arcraiders-data
   git pull
   ```

2. Check if there are any changes to sync:
   ```bash
   cd S:\_projects_\_arc-raiders_\logbook-overlay
   bun sync-data:check
   ```

3. Review the changes shown in the git diff

### Syncing Data

1. Run the sync script:
   ```bash
   bun sync-data
   ```

2. Review the changes:
   ```bash
   git diff src/data/
   git status src/data/
   ```

3. Commit the changes:
   ```bash
   git add src/data/
   git commit -m "chore: update game data from arcraiders-data"
   ```

### Building with Updated Data

After syncing, rebuild the application to include the latest data:

```bash
# Frontend build
bun run build

# Full Tauri app build/dev
bun tauri dev
```

## Troubleshooting

### Script Not Found

If you get "scripts not found" error, make sure you're in the logbook-overlay directory:
```bash
cd s:\_projects_\_arc-raiders_\logbook-overlay
```

### Permission Denied (Linux/Mac)

Make the bash script executable:
```bash
chmod +x scripts/sync-data.sh
```

### Path Issues

If the default arcraiders-data path doesn't exist, specify the correct path:
```bash
bun sync-data --arcraiders-data /correct/path/to/arcraiders-data
```

### No Changes Detected

If the script reports no changes, it usually means the data files are already up to date. You can:
1. Pull the latest changes from arcraiders-data: `cd arcraiders-data && git pull`
2. Then re-run the sync script

## Git Integration

The sync script automatically integrates with git:

- Shows which files have changed
- Displays a git diff summary
- Suggests the next git commands to commit changes

This allows you to review all changes before committing them to version control.
