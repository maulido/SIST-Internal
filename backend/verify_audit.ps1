$ErrorActionPreference = "Stop"

Write-Host "1. Logging in..."
$body = @{
    email    = "admin@sist.com"
    password = "password123"
}
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $body
$token = $loginResponse.access_token
Write-Host "   Token received."

Write-Host "2. Fetching Products..."
$products = Invoke-RestMethod -Uri "http://localhost:3000/products" -Method Get -Headers @{Authorization = "Bearer $token" }

if ($products.Count -eq 0) {
    Write-Host "   No products found."
    exit
}

$product = $products[0]
$id = $product.id
$name = $product.name
$price = $product.price
Write-Host "   Target: $name ($id) Price: $price"

$newPrice = [int]$price + 100
Write-Host "3. Updating Price to $newPrice..."

$updateBody = @{
    name  = $name
    price = $newPrice
}
$jsonBody = $updateBody | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/products/$id" -Method Put -Headers @{Authorization = "Bearer $token"; "Content-Type" = "application/json" } -Body $jsonBody


Write-Host "4. Fetching Audit Logs via API..."
$auditLogs = Invoke-RestMethod -Uri "http://localhost:3000/audit?limit=5" -Method Get -Headers @{Authorization = "Bearer $token" }
if ($auditLogs.Count -gt 0) {
    Write-Host "   [SUCCESS] Logs retrieved via API:"
    $auditLogs | ForEach-Object { 
        Write-Host "   - [$($_.createdAt)] $($_.action) on $($_.entity)" 
    }
}
else {
    Write-Host "   [WARNING] No logs returned from API."
}

Write-Host "5. Fetching Dashboard Stats..."
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3000/reports/dashboard" -Method Get -Headers @{Authorization = "Bearer $token" }
    if ($stats.totalRevenue) {
        Write-Host "   [SUCCESS] Dashboard Stats Retrieved:"
        Write-Host "   - Total Revenue: $($stats.totalRevenue)"
        Write-Host "   - Transactions Today: $($stats.txCountToday)"
        Write-Host "   - Recent Activity Count: $($stats.recentTransactions.Count)"
    }
    else {
        Write-Host "   [WARNING] Dashboard stats returned null/empty."
    }
}
catch {
    Write-Host "   [ERROR] Failed to fetch dashboard stats: $_"
}

Write-Host "   Verification Complete."
