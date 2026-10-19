@echo off
echo ========================================================
echo SCINSMEDIA - Installing Local Development SSL Authority
echo ========================================================
echo.
echo When the Windows Security prompt appears, click "Yes" to trust
echo the certificate for local HTTPS testing on localhost:3000.
echo.
certutil -user -addstore Root "%~dp0..\certs\ca-cert.pem"
echo.
echo Certificate installation complete.
echo You can now navigate to https://localhost:3000 with a secure padlock.
pause
