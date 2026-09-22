@echo off
setlocal
echo ======================================================
echo           AUTOMATIC GITHUB SYNC (FINDX / HRAPP)
echo ======================================================
echo.

set "GIT_EXE=%LOCALAPPDATA%\Git\cmd\git.exe"
if not exist "%GIT_EXE%" (
    set "GIT_EXE=git"
)

echo [1/4] Checking Git status...
"%GIT_EXE%" status -s

echo.
echo [2/4] Adding changes to Git...
"%GIT_EXE%" add .

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set "TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%"

echo.
echo [3/4] Committing changes...
"%GIT_EXE%" commit -m "Auto-update: %TIMESTAMP%"

echo.
echo [4/4] Pushing to GitHub...
"%GIT_EXE%" push -u origin main

echo.
echo ======================================================
echo            UPLOAD COMPLETED SUCCESSFULLY!
echo ======================================================
pause
