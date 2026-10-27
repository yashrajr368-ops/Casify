@echo off
title Push RETECH AI (Casify) to GitHub
color 0a
echo ============================================================
echo   RETECH AI - Smart Device Resale, Exchange and Repair
echo   Pushing code to GitHub: https://github.com/yashrajr368-ops/Casify
echo ============================================================
echo.
cd /d "%~dp0"

echo [1/3] Checking Remote Configuration...
git remote -v
echo.

echo [2/3] Current Branch and Commit:
git branch --show-current
git log -1 --oneline
echo.

echo [3/3] Pushing to branch 'main'...
echo ------------------------------------------------------------
echo NOTE: If a GitHub login window or browser tab opens,
echo       please click 'Sign in with your browser' / Authorize.
echo ------------------------------------------------------------
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo   [SUCCESS] Code pushed to GitHub successfully!
    echo   Live Repo: https://github.com/yashrajr368-ops/Casify
    echo ============================================================
) else (
    echo.
    echo [INFO] Push rejected or pending. Trying rebase / force push...
    git pull --rebase origin main
    git push -u origin main
    if %errorlevel% neq 0 (
        echo.
        echo Attempting force push to main branch...
        git push -u origin main --force
    )
)

echo.
echo ============================================================
echo   Process completed! Press any key to exit.
echo ============================================================
pause
