@echo off
title FindX Public Live Link
echo ===============================================================================
echo                FindX - Public Internet Live Link
echo ===============================================================================
echo.
echo Is window ko band mat kijiyega jab tak aapko live link chalana hai.
echo Yeh link aap apne mobile ya kisi bhi device par khol sakte hain.
echo.
ssh -R 80:localhost:8080 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 nokey@localhost.run
pause
