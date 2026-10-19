# =============================================================================
# SCINSMEDIA — Local SSL Certificate Generation Script
# =============================================================================
$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $PSScriptRoot
$certsDir = Join-Path $rootDir "certs"
if (!(Test-Path $certsDir)) {
    New-Item -ItemType Directory -Path $certsDir -Force | Out-Null
}

$opensslPaths = @(
    "C:\Program Files\Git\usr\bin\openssl.exe",
    "openssl"
)

$openssl = $null
foreach ($p in $opensslPaths) {
    if (Get-Command $p -ErrorAction SilentlyContinue) {
        $openssl = $p
        break
    }
}

if (!$openssl) {
    Write-Error "OpenSSL not found in standard paths. Please ensure Git for Windows or OpenSSL is installed."
    exit 1
}

Write-Host "Generating Local Development CA and SSL certificates in $certsDir..." -ForegroundColor Cyan

# 1. CA Private Key & Certificate
& $openssl genrsa -out "$certsDir\ca-key.pem" 2048
& $openssl req -x509 -new -nodes -key "$certsDir\ca-key.pem" -sha256 -days 3650 -out "$certsDir\ca-cert.pem" -subj "/CN=SCINSMEDIA Local Development CA/O=SCINS Media/OU=Development"

# 2. Localhost Private Key & CSR
& $openssl genrsa -out "$certsDir\localhost-key.pem" 2048
& $openssl req -new -key "$certsDir\localhost-key.pem" -out "$certsDir\localhost.csr" -subj "/CN=localhost/O=SCINS Media/OU=Development"

# 3. Extensions file with Subject Alternative Names (SAN)
@"
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
[alt_names]
DNS.1 = localhost
DNS.2 = 127.0.0.1
IP.1 = 127.0.0.1
"@ | Out-File -FilePath "$certsDir\localhost.ext" -Encoding ascii

# 4. Sign certificate using CA
& $openssl x509 -req -in "$certsDir\localhost.csr" -CA "$certsDir\ca-cert.pem" -CAkey "$certsDir\ca-key.pem" -CAcreateserial -out "$certsDir\localhost.pem" -days 825 -sha256 -extfile "$certsDir\localhost.ext"

Write-Host "Localhost SSL certificate generated successfully." -ForegroundColor Green
Write-Host "Cert: $certsDir\localhost.pem"
Write-Host "Key:  $certsDir\localhost-key.pem"
Write-Host "CA:   $certsDir\ca-cert.pem"
