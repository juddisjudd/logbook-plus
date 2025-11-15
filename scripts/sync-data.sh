#!/bin/bash

# Sync data from arcraiders-data to logbook-overlay
# This script copies JSON files from the arcraiders-data directory to the logbook-overlay src/data directory

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOGBOOK_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
ARCRAIDERS_DATA="${ARCRAIDERS_DATA:-S:/_projects_/_arc-raiders_/arcraiders-data}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Syncing data from arcraiders-data...${NC}"
echo "Arcraiders Data: $ARCRAIDERS_DATA"
echo "Logbook Overlay: $LOGBOOK_ROOT"
echo ""

# Function to sync a directory
sync_directory() {
    local source_dir="$1"
    local dest_dir="$2"
    local data_type="$3"

    if [ ! -d "$source_dir" ]; then
        echo -e "${RED}Source directory not found: $source_dir${NC}"
        return 1
    fi

    if [ ! -d "$dest_dir" ]; then
        echo -e "${YELLOW}Creating destination directory: $dest_dir${NC}"
        mkdir -p "$dest_dir"
    fi

    # Copy files
    local file_count=0
    while IFS= read -r -d '' file; do
        cp "$file" "$dest_dir/"
        ((file_count++))
    done < <(find "$source_dir" -maxdepth 1 -name "*.json" -print0)

    if [ $file_count -gt 0 ]; then
        echo -e "${GREEN}✓ Synced $file_count $data_type files${NC}"
    else
        echo -e "${YELLOW}! No $data_type files found${NC}"
    fi
}

# Track if any changes were made
changes_made=0

# Sync quests
if sync_directory "$ARCRAIDERS_DATA/quests" "$LOGBOOK_ROOT/src/data/quests" "quest"; then
    ((changes_made++))
fi

# Sync hideout
if sync_directory "$ARCRAIDERS_DATA/hideout" "$LOGBOOK_ROOT/src/data/hideout" "hideout"; then
    ((changes_made++))
fi

# Sync items
if sync_directory "$ARCRAIDERS_DATA/items" "$LOGBOOK_ROOT/src/data/items" "item"; then
    ((changes_made++))
fi

echo ""

# Check for git changes
if [ -d "$LOGBOOK_ROOT/.git" ]; then
    echo -e "${YELLOW}Checking for changes in git...${NC}"
    cd "$LOGBOOK_ROOT"

    if git diff --quiet src/data/ 2>/dev/null; then
        echo -e "${GREEN}✓ No changes detected${NC}"
    else
        echo -e "${YELLOW}Changes detected in src/data/:${NC}"
        git diff --stat src/data/ 2>/dev/null || true
        echo ""
        echo -e "${YELLOW}Staged files:${NC}"
        git status --short src/data/ 2>/dev/null || true
        echo ""
        echo -e "${YELLOW}Run 'git add src/data/' and 'git commit' to save changes${NC}"
    fi
fi

echo ""
echo -e "${GREEN}Data sync complete!${NC}"
