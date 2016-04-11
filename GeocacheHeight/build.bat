@echo off
set BASENAME=Geocache_Height
set BASEPATH=%HOMEPATH%\Documents\Dev\GitHub\userscripts\GeocacheHeight
set DEPLOYPATH=%APPDATA%\Mozilla\Firefox\Profiles\6rhioilk.default\gm_scripts\%BASENAME%

cd "%BASEPATH%"
copy "src\%BASENAME%.meta.js" .
copy /b "src\%BASENAME%.meta.js" + src\header.js + "src\formatHeight.js" + "src\%BASENAME%.js" + src\footer.js ".\%BASENAME%.user.js"
copy %BASENAME%.meta.js %DEPLOYPATH%
copy %BASENAME%.user.js %DEPLOYPATH%

copy "src\%BASENAME%_feet.meta.js" .
copy /b "src\%BASENAME%_feet.meta.js" + src\header.js + "src\formatHeight_feet.js" + "src\%BASENAME%.js" + src\footer.js ".\%BASENAME%_feet.user.js"
copy %BASENAME%_feet.meta.js %DEPLOYPATH%_(feet)
copy %BASENAME%_feet.user.js %DEPLOYPATH%_(feet)

set BASENAME=
set BASEPATH=