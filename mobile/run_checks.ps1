Set-Location 'C:\Users\gabri\Desktop\kore-app\mobile'

Write-Host "=== TSC ==="
$tscOut = & npx tsc --noEmit 2>&1
$tscExit = $LASTEXITCODE
foreach ($line in ($tscOut | Select-Object -Last 60)) { Write-Host $line }
Write-Host "TSC_EXIT=$tscExit"

Write-Host "=== TESTS ==="
$testOut = & npm test -- --passWithNoTests --forceExit 2>&1
$testExit = $LASTEXITCODE
foreach ($line in ($testOut | Select-Object -Last 80)) { Write-Host $line }
Write-Host "TEST_EXIT=$testExit"
