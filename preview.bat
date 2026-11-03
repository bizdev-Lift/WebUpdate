@echo off
REM Preview the Lift Commerce site the way Cloudflare serves it (clean URLs like /contact).
REM Needs Node.js. First run downloads the small "serve" package. Close this window to stop.
cd /d "%~dp0site"
start "" http://localhost:3000
npx --yes serve@14 . -l 3000
