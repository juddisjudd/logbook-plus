@echo off
REM Sync data from arcraiders-data to logbook-overlay
REM This script copies JSON files from the arcraiders-data directory to the logbook-overlay src/data directory

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
for %%i in ("%SCRIPT_DIR%..") do set "LOGBOOK_ROOT=%%~fi"

REM Set the arcraiders-data path (can be overridden by environment variable)
if not defined ARCRAIDERS_DATA (
    set "ARCRAIDERS_DATA=S:\_projects_\_arc-raiders_\arcraiders-data"
)

echo Syncing data from arcraiders-data...
echo Arcraiders Data: %ARCRAIDERS_DATA%
echo Logbook Overlay: %LOGBOOK_ROOT%
echo.

REM Function to sync a directory
setlocal enabledelayedexpansion
set "changes_made=0"

REM Sync quests
call :sync_directory "%ARCRAIDERS_DATA%\quests" "%LOGBOOK_ROOT%\src\data\quests" "quest"
if !errorlevel! equ 0 (
    set /a changes_made+=1
)

REM Sync hideout
call :sync_directory "%ARCRAIDERS_DATA%\hideout" "%LOGBOOK_ROOT%\src\data\hideout" "hideout"
if !errorlevel! equ 0 (
    set /a changes_made+=1
)

REM Sync items
call :sync_directory "%ARCRAIDERS_DATA%\items" "%LOGBOOK_ROOT%\src\data\items" "item"
if !errorlevel! equ 0 (
    set /a changes_made+=1
)

echo.

REM Check for git changes
if exist "%LOGBOOK_ROOT%\.git" (
    echo Checking for changes in git...
    cd /d "%LOGBOOK_ROOT%"

    for /f %%i in ('git diff --quiet src\data\ 2^>nul && echo 0 || echo 1') do set "has_changes=%%i"

    if !has_changes! equ 0 (
        echo No changes detected
    ) else (
        echo Changes detected in src\data\:
        git diff --stat src\data\ 2>nul || echo (unable to get diff)
        echo.
        echo Staged files:
        git status --short src\data\ 2>nul || echo (unable to get status)
        echo.
        echo Run 'git add src\data\' and 'git commit' to save changes
    )
)

echo.
echo Data sync complete!
pause
exit /b 0

:sync_directory
setlocal
set "source_dir=%~1"
set "dest_dir=%~2"
set "data_type=%~3"

if not exist "%source_dir%" (
    echo [ERROR] Source directory not found: %source_dir%
    exit /b 1
)

if not exist "%dest_dir%" (
    echo Creating destination directory: %dest_dir%
    mkdir "%dest_dir%"
)

REM Count and copy files
set "file_count=0"
for /r "%source_dir%" %%F in (*.json) do (
    copy /Y "%%F" "%dest_dir%\" >nul 2>&1
    set /a file_count+=1
)

if !file_count! gtr 0 (
    echo Synced !file_count! %data_type% files
    exit /b 0
) else (
    echo No %data_type% files found
    exit /b 1
)
