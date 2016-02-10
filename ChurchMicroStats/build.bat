@echo off
set BASENAME=Church_Micro_Stats
set BASEPATH=%HOMEPATH%\Documents\Dev\GitHub\userscripts\ChurchMicroStats

cd "%BASEPATH%"
copy "src\%BASENAME%.meta.js" .
copy /b "src\%BASENAME%.meta.js" + src\header.js + "src\%BASENAME%.js" + src\footer.js ".\%BASENAME%.user.js"

set BASENAME=
set BASEPATH=