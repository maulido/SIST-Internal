$ErrorActionPreference = "Stop"

function Test-Endpoint {
    param($Token, $Url, $Method, $ExpectedStatus, $RoleName)
    try {
        Invoke-RestMethod -Uri $Url -Method $Method -Headers @{Authorization = "Bearer $Token" } -ErrorAction Stop | Out-Null
        if ($ExpectedStatus -eq 200) {
            Write-Host "   [PASS] $RoleName -> $Method $Url (Allowed)" -ForegroundColor Green
        }
        else {
            Write-Host "   [FAIL] $RoleName -> $Method $Url (Should fail but passed)" -ForegroundColor Red
        }
    }
    catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq $ExpectedStatus) {
            Write-Host "   [PASS] $RoleName -> $Method $Url (Blocked as expected: $status)" -ForegroundColor Green
        }
        else {
            Write-Host "   [FAIL] $RoleName -> $Method $Url (Unexpected status: $status)" -ForegroundColor Red
        }
    }
}

# 1. Login as Staff (KASIR)
Write-Host "1. Testing STAFF Access..."
$staffBody = @{ email = "staff@sist.com"; password = "password123" }
$staffLogin = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $staffBody
$staffToken = $staffLogin.access_token

# Staff Tests
Test-Endpoint -Token $staffToken -Url "http://localhost:3000/audit" -Method Get -ExpectedStatus 403 -RoleName "STAFF"
Test-Endpoint -Token $staffToken -Url "http://localhost:3000/reports/dashboard" -Method Get -ExpectedStatus 403 -RoleName "STAFF"
Test-Endpoint -Token $staffToken -Url "http://localhost:3000/users" -Method Post -ExpectedStatus 403 -RoleName "STAFF"
# Assuming product ID exists or trying fake one, delete should fail authorization first
Test-Endpoint -Token $staffToken -Url "http://localhost:3000/products/fake-id" -Method Delete -ExpectedStatus 403 -RoleName "STAFF"


# 2. Login as Admin (OWNER)
Write-Host "`n2. Testing OWNER Access..."
$adminBody = @{ email = "admin@sist.com"; password = "password123" }
$adminLogin = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $adminBody
$adminToken = $adminLogin.access_token

# Owner Tests
Test-Endpoint -Token $adminToken -Url "http://localhost:3000/audit?limit=1" -Method Get -ExpectedStatus 200 -RoleName "OWNER"
Test-Endpoint -Token $adminToken -Url "http://localhost:3000/reports/dashboard" -Method Get -ExpectedStatus 200 -RoleName "OWNER"

Write-Host "`nVerification Complete."
