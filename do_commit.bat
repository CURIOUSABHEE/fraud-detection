@echo off
setlocal enabledelayedexpansion
cd /d "D:\rebel\Projects\Mini Project 2026"

echo Staging README.md...
git add README.md
if errorlevel 1 (
    echo Error adding file
    exit /b 1
)

echo Creating commit...
git commit -m "docs: remove support and roadmap sections from README" ^
    --trailer "Co-authored-by:Copilot <223556219+Copilot@users.noreply.github.com>"

if errorlevel 1 (
    echo Error creating commit
    exit /b 1
)

echo.
echo Commit successful! Showing latest commit:
git log --oneline -1
