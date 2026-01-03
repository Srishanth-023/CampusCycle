Write-Host "`n🧪 Testing CampusCycle Backend Connection`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "Test 1: Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get -UseBasicParsing
    Write-Host "✅ Backend is running" -ForegroundColor Green
    Write-Host "   Server: $($health.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is NOT responding" -ForegroundColor Red
    exit 1
}

# Test 2: Login
Write-Host "`nTest 2: Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        username = "admin"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $token = $loginResponse.token
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Get Cycles
Write-Host "`nTest 3: Get Cycles..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $cyclesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/cycles" `
        -Method Get `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ Cycles fetched successfully" -ForegroundColor Green
    Write-Host "   Available cycles: $($cyclesResponse.cycles.Count)" -ForegroundColor Gray
    foreach ($cycle in $cyclesResponse.cycles) {
        Write-Host "   - $($cycle.name): $($cycle.status) (RFID: $($cycle.rfidTag))" -ForegroundColor Gray
    }
    
    # Find first available cycle
    $availableCycle = $cyclesResponse.cycles | Where-Object { $_.status -eq "AVAILABLE" } | Select-Object -First 1
    
    if (-not $availableCycle) {
        Write-Host "❌ No available cycles found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to fetch cycles: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Book/Unlock Cycle
Write-Host "`nTest 4: Unlock Cycle $($availableCycle.name)..." -ForegroundColor Yellow
try {
    $bookBody = @{
        cycleId = $availableCycle.id
    } | ConvertTo-Json

    $bookResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/book" `
        -Method Post `
        -Headers $headers `
        -Body $bookBody `
        -ContentType "application/json" `
        -UseBasicParsing
    
    Write-Host "✅ Cycle unlocked successfully!" -ForegroundColor Green
    Write-Host "   Cycle: $($bookResponse.cycle.name)" -ForegroundColor Gray
    Write-Host "   RFID: $($bookResponse.rfidTag)" -ForegroundColor Gray
    Write-Host "   Method: $($bookResponse.unlockMethod)" -ForegroundColor Gray
    Write-Host "   Note: $($bookResponse.note)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to unlock cycle: $_" -ForegroundColor Red
    Write-Host "   Error details: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 5: Check ESP32 command
Write-Host "`nTest 5: Check ESP32 Command..." -ForegroundColor Yellow
try {
    $commandResponse = Invoke-RestMethod -Uri "http://localhost:3000/command" `
        -Method Get `
        -UseBasicParsing
    
    Write-Host "✅ ESP32 command retrieved" -ForegroundColor Green
    Write-Host "   Unlock: $($commandResponse.unlock)" -ForegroundColor Gray
    Write-Host "   Cycle ID: $($commandResponse.cycleId)" -ForegroundColor Gray
    Write-Host "   RFID Tag: $($commandResponse.rfidTag)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get ESP32 command: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "`nBackend is working correctly. If the mobile app isn't working," -ForegroundColor Yellow
Write-Host "check these things:" -ForegroundColor Yellow
Write-Host "1. Is the mobile app running? (npx expo start)" -ForegroundColor White
Write-Host "2. Is the IP address correct in api.ts? (http://10.147.233.168:3000)" -ForegroundColor White
Write-Host "3. Are you logged in on the mobile app?" -ForegroundColor White
Write-Host "4. Check mobile app console for errors (npx expo start and press 'j' for logs)" -ForegroundColor White
