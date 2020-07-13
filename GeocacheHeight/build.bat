@echo off
set BASENAME=Geocache_Height
set BASEPATH=%HOMEPATH%\Documents\Dev\GitHub\userscripts\GeocacheHeight

cd "%BASEPATH%"
copy "src\%BASENAME%.meta.js" .
copy /b "src\%BASENAME%.meta.js" + src\header.js + "src\formatHeight.js" + "src\%BASENAME%.js" + src\footer.js ".\%BASENAME%.user.js"

copy "src\%BASENAME%_feet.meta.js" .
copy /b "src\%BASENAME%_feet.meta.js" + src\header.js + "src\formatHeight_feet.js" + "src\%BASENAME%.js" + src\footer.js ".\%BASENAME%_feet.user.js"

set BASENAME=
set BASEPATH=