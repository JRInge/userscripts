@echo off
set BASENAME=Log_PMO_Cache
set BASEPATH=%HOMEPATH%\Documents\Dev\GitHub\userscripts\GeocachePMOLog
set DEPLOYPATH=%APPDATA%\Mozilla\Firefox\Profiles\6rhioilk.default\gm_scripts\%BASENAME%

cd "%BASEPATH%"
copy "src\%BASENAME%.meta.js" .
copy /b "src\%BASENAME%.meta.js" + src\header.js + "src\%BASENAME%.js" + src\footer.js ".\%BASENAME%.user.js"
copy %BASENAME%.meta.js %DEPLOYPATH%
copy %BASENAME%.user.js %DEPLOYPATH%

set BASENAME=
set BASEPATH=