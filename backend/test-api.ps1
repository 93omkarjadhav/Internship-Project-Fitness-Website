# Test API Endpoint Script
# This script helps you test the club-section API

Write-Host "========================================"
Write-Host "  Testing Club Section API"
Write-Host "========================================"
Write-Host ""

# Get token from user
Write-Host "To get your auth token:"
Write-Host "1. Open your app in browser: http://localhost:5173/welcome"
Write-Host "2. Press F12 → Application tab → Local Storage"
Write-Host "3. Copy the value of 'auth_token'"
Write-Host ""
$token = Read-Host "Paste your auth_token here (or press Enter to test without token)"

$port = 3001  # Backend runs on port 3001
$url = "http://localhost:$port/api/club-section?city=Pune"

Write-Host ""
Write-Host "Testing: $url"
Write-Host ""

if ([string]::IsNullOrEmpty($token)) {
    Write-Host "⚠️  Testing without token (may fail if auth required)..."
    Write-Host ""
    try {
        $response = Invoke-WebRequest -Uri $url -ErrorAction Stop
        $json = $response.Content | ConvertFrom-Json
        Write-Host "✅ SUCCESS: API responded without token!"
    } catch {
        Write-Host "❌ Error: $_"
        Write-Host ""
        Write-Host "The API requires authentication. Please provide a token."
        exit
    }
} else {
    Write-Host "✅ Using provided token..."
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    try {
        $response = Invoke-WebRequest -Uri $url -Headers $headers -ErrorAction Stop
        $json = $response.Content | ConvertFrom-Json
    } catch {
        Write-Host "❌ Error: $_"
        Write-Host ""
        Write-Host "Response Status: $($_.Exception.Response.StatusCode.value__)"
        exit
    }
}

# Display results
Write-Host ""
Write-Host "========================================"
Write-Host "  API Response"
Write-Host "========================================"
Write-Host ""

if ($json.clubs) {
    Write-Host "✅ Number of clubs: $($json.clubs.Count)"
    Write-Host ""
    
    if ($json.clubs.Count -gt 0) {
        $firstClub = $json.clubs[0]
        Write-Host "First Club Details:"
        Write-Host "  Name: $($firstClub.name)"
        Write-Host "  Location: $($firstClub.location)"
        Write-Host "  Price: Rs.$($firstClub.price_per_day)/day"
        Write-Host "  Image URL: $($firstClub.image_url)"
        Write-Host ""
        
        if ($firstClub.image_url -like "*cloudinary.com*") {
            Write-Host "✅ SUCCESS: Using Cloudinary CDN URLs!"
            Write-Host "   Images will load instantly from CDN"
        } else {
            Write-Host "❌ WARNING: Still using local paths"
            Write-Host "   Image URL: $($firstClub.image_url)"
            Write-Host ""
            Write-Host "   → Backend needs to be restarted"
            Write-Host "   → Check if imageMapping.json exists"
        }
    } else {
        Write-Host "⚠️  No clubs returned"
    }
} else {
    Write-Host "⚠️  Unexpected response format:"
    $json | ConvertTo-Json -Depth 3
}

Write-Host ""
Write-Host "========================================"


